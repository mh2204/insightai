from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="InsightLens AI API",
    description="Backend for InsightLens AI - Machine Learning & Data Insights Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev simplicity, or use regex for localhost rules
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to InsightLens AI API", "status": "running"}

# Placeholder for importing routers later
from app.routers import data, train, explain, predict, insight

app.include_router(data.router)
app.include_router(train.router)
app.include_router(explain.router)
app.include_router(predict.router)
app.include_router(insight.router)
