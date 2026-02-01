from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import shap
from .train import MODELS
from .data import DATASETS, clean_nan

router = APIRouter(
    prefix="/explain",
    tags=["explain"],
    responses={404: {"description": "Not found"}},
)

class ExplainRequest(BaseModel):
    model_id: str
    dataset_id: str

@router.post("/")
async def explain_model(request: ExplainRequest):
    """
    Generate SHAP feature importance for a trained model.
    """
    if request.model_id not in MODELS:
        raise HTTPException(status_code=404, detail="Model not found")
    
    if request.dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")

    model_info = MODELS[request.model_id]
    model = model_info["model"]
    feature_names = model_info["features"]
    
    # Get data
    df = DATASETS[request.dataset_id]["data"]
    # Preprocess similarly to training (basic)
    df_clean = df.dropna()
    # We need to make sure we only use the features the model was trained on
    # This is tricky without a persistent pipeline object, but we'll attempt to match columns
    try:
        X = pd.get_dummies(df_clean, drop_first=True)
        # Filter to keep only columns that are in feature_names, adding missing ones as 0
        for col in feature_names:
            if col not in X.columns:
                X[col] = 0
        X = X[feature_names]
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Data mismatch or preprocessing error: {str(e)}")

    # Use a sample for speed
    X_sample = X.sample(min(100, len(X)), random_state=42)

    try:
        # Generic SHAP explainer
        # For Tree models (XGB, RF) TreeExplainer is best, otherwise KernelExplainer
        if "XGB" in model_info["name"] or "Random Forest" in model_info["name"]:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X_sample)
        else:
             # Logistic/Linear use LinearExplainer or Kernel
            explainer = shap.Explainer(model, X_sample)
            shap_values = explainer(X_sample).values

        # Calculate mean absolute SHAP values for global feature importance
        if isinstance(shap_values, list): # For classification with multiple classes
            shap_values = shap_values[1] # Take positive class

        if len(shap_values.shape) > 2:
             # Handle 3D output (e.g. from interaction values or multi-class)
             shap_values = np.mean(np.abs(shap_values), axis=2) # simplified

        # Summarize importance
        # shap_values is (n_samples, n_features)
        # We want mean(|shap|) per feature
        if isinstance(shap_values, np.ndarray):
            mean_shap = np.mean(np.abs(shap_values), axis=0)
        else:
             # Handle shap.Explanation object
             mean_shap = np.mean(np.abs(shap_values.values), axis=0)

        importance_dict = dict(zip(feature_names, mean_shap))
        
        # Sort by importance
        sorted_importance = sorted(importance_dict.items(), key=lambda item: item[1], reverse=True)
        
        return clean_nan({
            "status": "success",
            "model_name": model_info["name"],
            "feature_importance": [{"feature": k, "importance": float(v)} for k, v in sorted_importance]
        })

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Explainability failed: {str(e)}")
