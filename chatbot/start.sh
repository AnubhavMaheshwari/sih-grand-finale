#!/bin/bash

# SARTHI Chatbot Startup Script
# This script sets up and starts the chatbot service

echo "🚀 Starting SARTHI Chatbot..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📋 Creating .env from example..."
    cp .env.example .env
    echo "🔑 Please update the .env file with your GROQ_API_KEY"
fi

# Start the chatbot server
echo "🚀 Starting chatbot server on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🏥 Health Check: http://localhost:8000/api/v1/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the chatbot
python -m src.main
