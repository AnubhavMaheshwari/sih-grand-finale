from fastapi import APIRouter
from pydantic import BaseModel
import os
from typing import Dict, Any

router = APIRouter()

class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str
    version: str
    environment: str
    llm_available: bool
    content_filter_available: bool
    uptime: float

# Track startup time for uptime calculation
import time
_startup_time = time.time()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for monitoring service status.
    
    Returns detailed information about the chatbot service health,
    including LLM availability and content filter status.
    """
    try:
        # Check LLM availability
        llm_available = False
        try:
            from src.services.llm_service import llm_service
            # Try to access the API key (won't actually make API call)
            if os.getenv("GROQ_API_KEY"):
                llm_available = True
        except:
            llm_available = False
        
        # Check content filter availability
        content_filter_available = False
        try:
            from src.core.content_filter import content_filter
            content_filter_available = True
        except:
            content_filter_available = False
        
        # Calculate uptime
        uptime = time.time() - _startup_time
        
        return HealthResponse(
            status="healthy",
            version="2.0.0",
            environment=os.getenv("ENVIRONMENT", "development"),
            llm_available=llm_available,
            content_filter_available=content_filter_available,
            uptime=round(uptime, 2)
        )
        
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            version="2.0.0",
            environment=os.getenv("ENVIRONMENT", "development"),
            llm_available=False,
            content_filter_available=False,
            uptime=round(time.time() - _startup_time, 2)
        )

@router.get("/health/llm")
async def llm_health_check():
    """
    Detailed LLM health check.
    
    Tests actual LLM connectivity by making a small test request.
    """
    try:
        from src.services.llm_service import llm_service
        
        # Make a simple test request
        test_result = llm_service.generate_answer(
            question="What is 2+2?",
            context="You are a helpful assistant. 2+2 equals 4."
        )
        
        return {
            "status": "healthy",
            "llm_provider": "GROQ",
            "model": llm_service.model,
            "test_successful": True,
            "response_preview": test_result["answer"][:100] + "..." if len(test_result["answer"]) > 100 else test_result["answer"]
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "llm_provider": "GROQ",
            "error": str(e),
            "test_successful": False
        }

@router.get("/health/content-filter")
async def content_filter_health_check():
    """
    Content filter health check.
    
    Tests the content filter with sample inputs.
    """
    try:
        from src.core.content_filter import content_filter
        
        # Test cases
        test_cases = [
            ("Hello, how are you?", True, None),
            ("This is a test question about education.", True, None),
            ("Fuck you!", False, "vulgar"),
            ("What is sex education?", True, None),  # Educational context allowed
        ]
        
        results = []
        for test_input, expected_appropriate, expected_violation in test_cases:
            is_appropriate, violation_type = content_filter.is_content_appropriate(test_input)
            results.append({
                "input": test_input,
                "is_appropriate": is_appropriate,
                "violation_type": violation_type,
                "expected_appropriate": expected_appropriate,
                "expected_violation": expected_violation,
                "passed": is_appropriate == expected_appropriate and violation_type == expected_violation
            })
        
        all_passed = all(result["passed"] for result in results)
        
        return {
            "status": "healthy" if all_passed else "degraded",
            "all_tests_passed": all_passed,
            "test_results": results
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "all_tests_passed": False
        }
