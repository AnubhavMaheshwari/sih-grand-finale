from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional

router = APIRouter()

class InstituteContextRequest(BaseModel):
    """Request model for institute context endpoint."""
    institute_data: Dict[str, Any]

class InstituteContextResponse(BaseModel):
    """Response model for institute context endpoint."""
    success: bool
    formatted_context: str
    message: str

@router.post("/institute/context", response_model=InstituteContextResponse)
async def format_institute_context(request: InstituteContextRequest):
    """
    Format institute data into a structured context for the chatbot.
    
    This endpoint takes raw institute data and formats it into a 
    structured text context that can be used by the chatbot.
    """
    try:
        formatted_context = _format_institute_data(request.institute_data)
        
        return InstituteContextResponse(
            success=True,
            formatted_context=formatted_context,
            message="Institute data formatted successfully for chatbot context"
        )
        
    except Exception as e:
        return InstituteContextResponse(
            success=False,
            formatted_context="",
            message=f"Error formatting institute data: {str(e)}"
        )

def _format_institute_data(data: Dict[str, Any]) -> str:
    """Format institute data into structured text context."""
    context = "Institute Analysis Context:\n\n"
    
    # Basic institute info
    context += f"INSTITUTE: {data.get('instituteName', data.get('name', 'Unknown'))}\n"
    context += f"TYPE: {data.get('instituteType', data.get('type', 'Unknown'))}\n"
    context += f"LOCATION: {data.get('location', 'Unknown')}\n"
    context += f"STATUS: {data.get('status', 'Unknown')}\n"
    context += f"COMPLETENESS SCORE: {data.get('completenessScore', 0)}%\n"
    context += f"VERIFIED: {'Yes' if data.get('isVerified') else 'No'}\n\n"
    
    # Latest data if available
    latest_data = data.get('latestData')
    if latest_data:
        context += f"LATEST DATA (Academic Year: {latest_data.get('academicYear', 'N/A')}):\n"
        
        # Financial data
        if latest_data.get('financialCapacity') or latest_data.get('budgetAllocation'):
            context += f"Financial Capacity: {latest_data.get('financialCapacity', 'N/A')}\n"
            context += f"Budget Allocation: {latest_data.get('budgetAllocation', 'N/A')}\n"
        
        # Academic data
        if latest_data.get('teacherStudentRatio') or latest_data.get('placementPercentage'):
            context += f"Teacher-Student Ratio: {latest_data.get('teacherStudentRatio', 'N/A')}\n"
            context += f"Placement Percentage: {latest_data.get('placementPercentage', 'N/A')}\n"
            context += f"Students Going for Higher Studies: {latest_data.get('studentsGoingForHigherStudies', 'N/A')}\n"
        
        # Infrastructure data
        if latest_data.get('vacancyBoysHostelUG') or latest_data.get('vacancyGirlsHostelUG'):
            context += f"Boys Hostel Vacancy (UG): {latest_data.get('vacancyBoysHostelUG', 'N/A')}\n"
            context += f"Girls Hostel Vacancy (UG): {latest_data.get('vacancyGirlsHostelUG', 'N/A')}\n"
            context += f"Classroom Capacity: {latest_data.get('classroomCapacity', 'N/A')}\n"
            context += f"Land Area: {latest_data.get('landAreaSqKm', 'N/A')} sqkm\n"
        
        # Facilities data
        if latest_data.get('facultyStrength') or latest_data.get('labEquipments'):
            context += f"Faculty Strength: {latest_data.get('facultyStrength', 'N/A')}\n"
            context += f"Lab Equipment Count: {latest_data.get('labEquipments', 'N/A')}\n"
            context += f"Available Workshops: {latest_data.get('availableWorkshops', 'N/A')}\n"
        
        # Financial metrics from insights
        if latest_data.get('capitalExpenditure') or latest_data.get('operationalExpenditure'):
            context += f"Capital Expenditure: {latest_data.get('capitalExpenditure', 'N/A')}\n"
            context += f"Operational Expenditure: {latest_data.get('operationalExpenditure', 'N/A')}\n"
    
    # Add any additional insights or analytics data
    insights = data.get('insights', {})
    if insights:
        context += "\nANALYTICS INSIGHTS:\n"
        for key, value in insights.items():
            if value:
                context += f"{key.replace('_', ' ').title()}: {value}\n"
    
    return context
