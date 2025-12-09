from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.llm_service import llm_service
from core.content_filter import content_filter

router = APIRouter()

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    question: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    success: bool
    answer: str
    confidence: float
    source: str
    violation_type: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_context(request: ChatRequest):
    """
    Chat endpoint that accepts questions with optional context.
    
    If context is provided, it will be used as the basis for answering.
    If no context is provided, a general educational context is used.
    """
    try:
        # Use provided context or default to general educational context
        context = request.context or """
        You are SARTHI, an educational assistant for analyzing institute data.
        You help users understand educational institution rankings, financial data,
        academic performance, infrastructure, and other educational metrics.
        """
        
        # Generate answer using LLM service
        result = llm_service.generate_answer(request.question, context)
        
        return ChatResponse(
            success=True,
            answer=result["answer"],
            confidence=result["confidence"],
            source=result["source"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )

@router.post("/chat/validate")
async def validate_content(text: str):
    """
    Validate if content is appropriate according to content policy.
    
    Useful for frontend validation before sending to chatbot.
    """
    is_appropriate, violation_type = content_filter.is_content_appropriate(text)
    
    return {
        "is_appropriate": is_appropriate,
        "violation_type": violation_type,
        "message": (
            content_filter.get_policy_violation_response(violation_type)
            if not is_appropriate else "Content is appropriate"
        )
    }
