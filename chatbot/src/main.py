"""
Main FastAPI application for SARTHI Chatbot
Run using: python -m src.main (from chatbot directory)
"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Import routers
from src.routes.chat import router as chat_router
from src.routes.institute import router as institute_router
from src.routes.health import router as health_router

# Create FastAPI app
app = FastAPI(
    title="SARTHI Chatbot API",
    description="AI-powered chatbot for educational institute data analysis",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api/v1", tags=["chat"])
app.include_router(institute_router, prefix="/api/v1", tags=["institute"])
app.include_router(health_router, prefix="/api/v1", tags=["health"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to SARTHI Chatbot API",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "chat": "/api/v1/chat",
            "institute_context": "/api/v1/institute/context",
            "health": "/api/v1/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
