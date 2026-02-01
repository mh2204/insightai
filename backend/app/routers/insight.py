from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from openai import OpenAI

router = APIRouter(
    prefix="/insight",
    tags=["insight"],
    responses={404: {"description": "Not found"}},
)

client = None
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    client = OpenAI(api_key=api_key)

class InsightRequest(BaseModel):
    context: str
    query: str

@router.post("/")
async def generate_insight(request: InsightRequest):
    """
    Generate a text summary or answer utilizing OpenAI API.
    Falls back to a mock response if no API key is set.
    """
    if not client:
        # Mock response for demo/testing without API key
        return {
            "response": f"**Note: OpenAI API Key not found. Running in simulation mode.**\n\nBased on your query '{request.query}', the model appears to be performing well with the provided context. Feature importances suggest that the top variables are driving the predictions effectively.",
            "mode": "simulation"
        }
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # or gpt-4
            messages=[
                {"role": "system", "content": "You are an expert data science advisor named InsightLens. Your goal is to explain machine learning models and data trends to business users clearly and concisely. Use the context provided to answer the user's question."},
                {"role": "user", "content": f"Context: {request.context}\n\nQuestion: {request.query}"}
            ],
            max_tokens=300,
            temperature=0.7
        )
        return {
            "response": response.choices[0].message.content,
            "mode": "live"
        }
    except Exception as e:
        # Graceful degradation
        return {
            "response": f"Error generating insight: {str(e)}. Please check your API key.",
            "mode": "error"
        }
