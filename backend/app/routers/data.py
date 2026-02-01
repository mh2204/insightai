from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
import os
import uuid
import json

router = APIRouter(
    prefix="/data",
    tags=["data"],
    responses={404: {"description": "Not found"}},
)

# In-memory storage for simple demo purposes (production would use a database or S3)
DATASETS = {}

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a CSV or Excel file and load it into a pandas DataFrame.
    Returns: Dataset ID, columns, and shape.
    """
    try:
        content = await file.read()
        filename = file.filename
        
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(content))
        elif filename.endswith(".json"):
             df = pd.read_json(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload csv, excel, or json.")

        # Assign a generic ID
        dataset_id = str(uuid.uuid4())
        
        # Store metadata and data (in memory for now)
        DATASETS[dataset_id] = {
            "id": dataset_id,
            "filename": filename,
            "data": df, # Be careful with memory usage in production
            "columns": df.columns.tolist(),
            "shape": df.shape
        }

        return clean_nan({
            "status": "success",
            "dataset_id": dataset_id,
            "filename": filename,
            "columns": df.columns.tolist(),
            "shape": df.shape,
            "preview": df.head(5).to_dict(orient="records")
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

import math

def clean_nan(obj):
    """
    Recursively replace NaN float values with None (which becomes null in JSON).
    """
    if isinstance(obj, float):
        return None if math.isnan(obj) or math.isinf(obj) else obj
    elif isinstance(obj, dict):
        return {k: clean_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan(v) for v in obj]
    return obj

@router.get("/profile/{dataset_id}")
async def profile_dataset(dataset_id: str):
    """
    Return summary statistics and column types for a dataset.
    """
    if dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = DATASETS[dataset_id]["data"]
    
    profile = {
        "columns": list(df.columns),
        "dtypes": {k: str(v) for k, v in df.dtypes.items()},
        "missing": df.isnull().sum().to_dict(),
        "description": df.describe(include='all').fillna("NaN").to_dict()
    }
    
    # Calculate simple correlations for numeric columns
    numeric_df = df.select_dtypes(include=['number'])
    if not numeric_df.empty:
        profile["correlations"] = numeric_df.corr().fillna(0).to_dict()
    
    return clean_nan(profile)
