#!/usr/bin/env python3
"""
Run script for SARTHI Chatbot
Run this from the chatbot directory, not from src directory
"""
import os
import sys

# Add the project root to the path if needed
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import and run the app
from src.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "run:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
