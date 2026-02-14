from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import google.generativeai as genai
from app.core.store import DATASETS
import pandas as pd
import numpy as np

router = APIRouter(
    prefix="/insight",
    tags=["insight"],
    responses={404: {"description": "Not found"}},
)

api_key = os.getenv("GEMINI_API_KEY")
model = None

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')

class InsightRequest(BaseModel):
    context: str
    query: str

@router.post("/")
async def generate_insight(request: InsightRequest):
    """
    Generate a text summary or answer utilizing Google Gemini API.
    Falls back to a mock response if no API key is set.
    """
    if not model:
        # Mock response for demo/testing without API key
        return {
            "response": f"**Note: GEMINI API Key not found. Running in simulation mode.**\n\nBased on your query '{request.query}', the model appears to be performing well with the provided context. Feature importances suggest that the top variables are driving the predictions effectively.",
            "mode": "simulation"
        }
    
    try:
        # Construct prompt
        prompt = f"""
        System: You are an expert data science advisor named InsightLens. Your goal is to explain machine learning models and data trends to business users clearly and concisely.
        
        Context: {request.context}
        
        Question: {request.query}
        """
        
        response = model.generate_content(prompt)
        
        return {
            "response": response.text,
            "mode": "live"
        }
    except Exception as e:
        # Graceful degradation
        return {
            "response": f"Error generating insight: {str(e)}. Please check your API key.",
            "mode": "error"
        }

@router.get("/story/{dataset_id}")
async def generate_story(dataset_id: str):
    """
    Generate a narrative story about the dataset using Gemini.
    """
    if dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = DATASETS[dataset_id]["data"]
    
    # Calculate basic stats for context
    n_rows, n_cols = df.shape
    columns = list(df.columns)
    numeric_df = df.select_dtypes(include=['number'])
    
    correlations = {}
    if not numeric_df.empty:
        corr_matrix = numeric_df.corr().abs()
        # Find top correlation pairs (excluding diagonal)
        sol = (corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
               .stack()
               .sort_values(ascending=False))
        top_correlations = sol.head(3).to_dict()
        correlations = {f"{k[0]} & {k[1]}": v for k, v in top_correlations.items()}

    context = f"""
    Dataset Overview:
    - Rows: {n_rows}
    - Columns: {n_cols}
    - Column Names: {', '.join(columns[:10])}...
    - Strongest Correlations: {correlations}
    """

    if not model:
        # Fallback procedural story
        sections = [
            {
                "title": "The Beginning",
                "text": f"We started with a dataset containing {n_rows} records and {n_cols} features. It serves as a window into the underlying phenomena we are studying."
            },
            {
                "title": "The Discovery",
                "text": f"Hidden within these rows are connections. For instance, we see strong relationships between {list(correlations.keys())[0] if correlations else 'various features'}, suggesting that these factors move together."
            },
            {
                "title": "The Intelligence",
                "text": "By applying machine learning algorithms, we can decode these patterns. Models like Random Forest or XGBoost can learn from these historical examples to predict future outcomes."
            },
            {
                "title": "The Future",
                "text": "With this intelligence, you can verify your assumptions and make data-driven decisions. Use the Predict tab to see this model in action on new data."
            }
        ]
        return {"story": sections, "mode": "simulation"}

    try:
        prompt = f"""
        Based on the following dataset summary, write a 4-part data story (The Beginning, The Discovery, The Intelligence, The Future).
        Make it engaging, professional, and insightful for a business user.
        
        Section requirements:
        1. The Beginning: Intro to the data size and scope.
        2. The Discovery: Mention interesting correlations or patterns.
        3. The Intelligence: Explain how modeling can help.
        4. The Future: Call to action for making predictions.
        
        Return the response as a VALID JSON object with a key 'sections' which is a list of objects, each having 'title', 'text', and 'align' (optional 'left' or 'right').
        Do NOT use markdown formatting (like ```json) in the response. Return raw JSON.
        
        Summary:
        {context}
        """

        response = model.generate_content(prompt)
        content = response.text
        
        # Clean up possible markdown fences if Gemini adds them
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        import json
        return json.loads(content) # Expecting {"sections": [...]}
        
    except Exception as e:
        print(f"Error generating story: {e}")
        return {
            "story": [
                {"title": "Error", "text": "Could not generate story via AI. Please check logs/API key."}
            ],
            "mode": "error"
        }
