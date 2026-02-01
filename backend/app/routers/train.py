from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, f1_score, r2_score, mean_squared_error
import xgboost as xgb
import uuid
from .data import DATASETS, clean_nan

router = APIRouter(
    prefix="/train",
    tags=["train"],
    responses={404: {"description": "Not found"}},
)

# In-memory model storage
MODELS = {}

class TrainRequest(BaseModel):
    dataset_id: str
    target_column: str
    problem_type: Optional[str] = None # "classification" or "regression" (optional, auto-detect)

@router.post("/")
async def train_model(request: TrainRequest):
    """
    Train multiple models on the dataset and return the best one's metrics.
    """
    if request.dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = DATASETS[request.dataset_id]["data"]
    
    if request.target_column not in df.columns:
         raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found in dataset")
    
    # Simple preprocessing: Drop NA, encoding (dummies)
    # In a real app, this pipeline would be much more robust
    df_clean = df.dropna()
    
    # Pre-cleaning: Attempt to convert object columns to numeric if they look like numbers (e.g. "1,234", "$500")
    for col in df_clean.columns:
        if df_clean[col].dtype == 'object':
            try:
                # Check if stripping symbol/comma makes it numeric
                cleaned = df_clean[col].astype(str).str.replace(r'[$,]', '', regex=True)
                # If we can convert the entire column without error, it's numeric
                df_clean[col] = pd.to_numeric(cleaned)
            except:
                # If conversion fails (e.g. real text), keep as is
                pass

    X = df_clean.drop(columns=[request.target_column])
    y = df_clean[request.target_column]
    
    # Optimize: Drop high-cardinality columns (e.g., IDs, Names) to prevent MemoryError
    # causing massive expansion with get_dummies (e.g., 23k+ columns)
    categorical_cols = X.select_dtypes(include=['object', 'category']).columns
    dropped_cols = []
    for col in categorical_cols:
        if X[col].nunique() > 50: # Threshold for "too many categories"
            X = X.drop(columns=[col])
            dropped_cols.append(col)

    # Capture Input Schema (Before get_dummies)
    # This tells the frontend exactly what fields to show (e.g. "Currency" dropdown)
    input_schema = []
    for col in X.columns:
        if pd.api.types.is_numeric_dtype(X[col]):
            input_schema.append({"name": col, "type": "numeric"})
        else:
            # It's categorical
            unique_vals = X[col].dropna().unique().tolist()
            input_schema.append({"name": col, "type": "categorical", "options": unique_vals})
            
    X = pd.get_dummies(X, drop_first=True)

    # Determine problem type if not provided
    problem_type = request.problem_type
    unique_y_count = y.nunique()
    
    if not problem_type:
        if pd.api.types.is_numeric_dtype(y):
             if unique_y_count > 20:
                 problem_type = "regression"
             else:
                 problem_type = "classification"
        else:
             # Non-numeric target
             if unique_y_count > 50: 
                  # Try to convert to numeric (maybe it's a numeric string with $ or ,?)
                  try:
                      # explicit clean up for common currency/formatting
                      y_clean = y.astype(str).str.replace(r'[$,]', '', regex=True)
                      y_numeric = pd.to_numeric(y_clean, errors='raise')
                      y = y_numeric
                      problem_type = "regression"
                  except:
                      # Truly high-cardinality categorical target
                      raise HTTPException(status_code=400, detail=f"Target '{request.target_column}' has {unique_y_count} unique values. Too high for classification. Please select a numeric target or one with fewer categories.")
             else:
                  problem_type = "classification"
            
    # If classification was decided (or requested) but cardinality is still huge, fail fast
    if problem_type == "classification" and unique_y_count > 100:
         raise HTTPException(status_code=400, detail=f"Target '{request.target_column}' has {unique_y_count} classes. This is too many for classification. Did you mean regression?")

    if problem_type == "classification":
        # Encode y if classification but not numeric
        if not pd.api.types.is_numeric_dtype(y):
                y = y.astype('category').cat.codes
                 
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    results = []
    
    try:
        if problem_type == "classification":
            models = {
                "Logistic Regression": LogisticRegression(max_iter=1000),
                "Random Forest": RandomForestClassifier(n_estimators=100),
                "XGBoost": xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
            }
            
            for name, model in models.items():
                model.fit(X_train, y_train)
                preds = model.predict(X_test)
                acc = accuracy_score(y_test, preds)
                f1 = f1_score(y_test, preds, average='weighted')
                results.append({
                    "model": name,
                    "accuracy": float(acc),
                    "f1": float(f1),
                    "model_id": str(uuid.uuid4()), # We need to generate ID before storing
                    "type": "classification"
                })
                # Store model
                model_id = results[-1]["model_id"]
                MODELS[model_id] = {
                    "model": model, 
                    "name": name, 
                    "type": "classification", 
                    "features": X.columns.tolist(), # Expected dummy columns for backend validation
                    "input_schema": input_schema,   # User-facing form schema
                    "target": request.target_column
                }

        else: # Regression
            models = {
                "Linear Regression": LinearRegression(),
                "Random Forest": RandomForestRegressor(n_estimators=100),
                "XGBoost": xgb.XGBRegressor()
            }
            
            for name, model in models.items():
                model.fit(X_train, y_train)
                preds = model.predict(X_test)
                r2 = r2_score(y_test, preds)
                mse = mean_squared_error(y_test, preds)
                results.append({
                    "model": name,
                    "r2": float(r2),
                    "mse": float(mse),
                    "model_id": str(uuid.uuid4()),
                    "type": "regression"
                })
                # Store model
                model_id = results[-1]["model_id"]
                MODELS[model_id] = {
                    "model": model, 
                    "name": name, 
                    "type": "regression", 
                    "features": X.columns.tolist(),
                    "input_schema": input_schema,
                    "target": request.target_column
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

    # Sort results by primary metric
    if problem_type == "classification":
        results.sort(key=lambda x: x['accuracy'], reverse=True)
    else:
        results.sort(key=lambda x: x['r2'], reverse=True)

    return clean_nan({
        "status": "success",
        "dataset_id": request.dataset_id,
        "problem_type": problem_type,
        "results": results,
        "best_model": results[0] if results else None,
        "dropped_columns": dropped_cols
    })
