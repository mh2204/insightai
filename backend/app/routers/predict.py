from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Union
import pandas as pd
from .train import MODELS
from .data import clean_nan

router = APIRouter(
    prefix="/predict",
    tags=["predict"],
    responses={404: {"description": "Not found"}},
)

class PredictRequest(BaseModel):
    model_id: str
    features: Dict[str, Union[int, float, str]]

@router.get("/metadata/{model_id}")
async def get_model_metadata(model_id: str):
    if model_id not in MODELS:
        raise HTTPException(status_code=404, detail="Model not found")
    
    info = MODELS[model_id]
    return {
        "model_id": model_id,
        "type": info["type"],
        "target": info.get("target", "Unknown"), # Default for older models in memory
        "features": info["features"],
        "input_schema": info.get("input_schema", [])
    }

@router.post("/")
async def make_prediction(request: PredictRequest):
    """
    Make a prediction using a specific trained model.
    """
    if request.model_id not in MODELS:
        raise HTTPException(status_code=404, detail="Model not found")

    model_info = MODELS[request.model_id]
    model = model_info["model"]
    expected_features = model_info["features"]
    
    # alignment check
    input_data = pd.DataFrame([request.features])
    
    # Preprocessing (Match training)
    # 1. Handle Categorical: Ideally we need the same dummy columns. 
    # This is a simplification. In prod, we'd save the OneHotEncoder.
    input_dummies = pd.get_dummies(input_data)
    
    # Reindex to match training columns, filling missing with 0
    final_input = input_dummies.reindex(columns=expected_features, fill_value=0)
    
    try:
        prediction = model.predict(final_input)[0]
        
        result = {
            "prediction": float(prediction) if isinstance(prediction, (float, int)) else str(prediction),
            "model_type": model_info["type"]
        }
        
        if model_info["type"] == "classification" and hasattr(model, "predict_proba"):
            probs = model.predict_proba(final_input)[0]
            result["probabilities"] = probs.tolist()
            
        return clean_nan(result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
