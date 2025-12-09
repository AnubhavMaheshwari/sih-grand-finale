import os
from typing import Dict, Any, Optional
from groq import Groq
from core.content_filter import content_filter

class LLMService:
    """Service for handling LLM interactions with GROQ."""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables.")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.1-8b-instant"
    
    def generate_answer(self, question: str, context: str, max_retries: int = 2) -> Dict[str, Any]:
        """
        Generate answer with content safety checks and validation.
        
        Args:
            question: User's question
            context: Context/institute data
            max_retries: Maximum retry attempts
            
        Returns:
            Dictionary with answer and confidence
        """
        # Check if question is appropriate
        is_appropriate, violation_type = content_filter.is_content_appropriate(question)
        if not is_appropriate:
            return {
                "answer": content_filter.get_policy_violation_response(violation_type),
                "confidence": 1.0,
                "source": "content_policy"
            }
        
        # Check if context is appropriate
        is_context_appropriate, context_violation = content_filter.is_content_appropriate(context)
        if not is_context_appropriate:
            return {
                "answer": "I apologize, but the provided context contains inappropriate content that violates my policy.",
                "confidence": 1.0,
                "source": "context_policy"
            }
        
        # Prepare the prompt
        prompt = self._create_prompt(question, context)
        
        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are SARTHI, a friendly and knowledgeable AI assistant created by team DEVDOMINATORS. "
                                "You help users understand educational institution data and rankings. "
                                "You're enthusiastic about helping and maintain a positive tone. "
                                "When you don't know something, you're honest about it. "
                                "STRICT CONTENT POLICY: No vulgar, sexual, biased, or caste-discriminatory content. "
                                "If any request violates policy, politely decline. "
                                "IMPORTANT: Keep your answers SHORT and CONCISE. Avoid long explanations unless asked."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.3,
                    max_tokens=800,
                    top_p=0.9,
                )
                
                answer = response.choices[0].message.content.strip()
                
                # Validate generated answer
                is_answer_appropriate, answer_violation = content_filter.is_content_appropriate(answer)
                if not is_answer_appropriate:
                    answer = "I apologize, but I cannot provide the generated response as it violates my content policy. Please try a different question."
                
                # Add conversational touch
                answer = self._add_conversational_touch(answer, question)
                
                # Calculate confidence (simplified for now)
                confidence = self._calculate_confidence(answer, context)
                
                return {
                    "answer": answer,
                    "confidence": confidence,
                    "source": "llm"
                }
                
            except Exception as e:
                if attempt == max_retries - 1:
                    return {
                        "answer": f"I apologize, but I'm having trouble processing your request right now. Error: {str(e)}",
                        "confidence": 0.0,
                        "source": "error"
                    }
    
    def _create_prompt(self, question: str, context: str) -> str:
        """Create a comprehensive prompt for the LLM."""
        return f"""
You are SARTHI, a friendly and knowledgeable AI assistant created by team DEVDOMINATORS. Your personality traits:
1. Friendly and approachable, like a helpful colleague
2. Knowledgeable about educational institutions and rankings
3. Conversational but professional
4. Concise and to-the-point
5. Polite when you don't have information

CRITICAL GUIDELINES:
1. ALWAYS use ONLY information from the provided context below
2. Financial values in the context are ALREADY FORMATTED in Crores (Cr) - use them EXACTLY as shown
3. When you see "₹18.00 Cr" in context, say "₹18.00 Cr" in your response (NOT the raw number)
4. If you see contradictions in context, mention: "There seems to be some inconsistency in the data"
5. When listing items, present them clearly with bullet points or numbers
6. Use conversational transitions: "Based on the data...", "I found that...", "The information shows..."

SPECIAL RULE FOR GENERAL UGC/AICTE QUESTIONS:
- If the question is about general UGC or AICTE information (not specific to this institute):
  * If the answer is in the context: Respond in MAXIMUM 15 words
  * If NOT in context: Say "I'm not able to show that information. I can only help with this institute's data."

SPECIAL RULE FOR PREDICTION QUESTIONS:
- If asked about future trends, predictions, or "next year" data:
  * Use the "TREND ANALYSIS & PREDICTIONS" section from the context
  * Mention the growth trend (increasing/decreasing by X%)
  * Provide the predicted value for next year
  * Example: "Capital expenditure is increasing by 45.5% year-over-year. Predicted for next year: ₹212.00 Cr."


RESPONSE LENGTH RULES:
- For ONLY greetings (just "hi", "hello", "hey" with no other words): Respond with 1 short sentence
- For general UGC/AICTE questions: Maximum 15 words OR polite denial
- For institute data questions: Answer using the context in 2-3 sentences
- For simple questions: 2-3 sentences maximum
- For complex questions or "explain in detail": 4-5 sentences maximum
- NEVER write long paragraphs unless explicitly asked

CONTEXT FROM INSTITUTE DATA:
{context}

USER QUESTION:
"{question}"

Response format:
1. If ONLY a greeting (just "hi" or "hello" alone): Say "Hi! I'm SARTHI. How can I help you with this institute's data?"
2. If asking about general UGC/AICTE info: Answer in max 15 words OR say "I'm not able to show that information."
3. For institute data questions: Answer DIRECTLY with the data - NO greetings, NO "You're asking about...", just the answer
4. Example good response: "The library expenditure for 2021-22 was ₹18.00 Cr."
5. Example bad response: "Hi! I'm SARTHI. You're asking about the library budget. The library expenditure was..."

IMPORTANT - When information is NOT available in the context:
- "I apologize, but I don't have that specific information in the current data."
- "I'm sorry, I couldn't find details about that in the available records."
- "Unfortunately, that information isn't available in the data I have access to."

REMEMBER: 
- For data questions: Skip greetings and acknowledgments - just answer directly
- For UGC/AICTE general questions: Max 15 words or polite denial
- Use the formatted values EXACTLY as they appear in the context (e.g., "₹18.00 Cr" not "₹180000000")
- Be concise and to the point

Now, provide a helpful, concise response using the context above:
"""
    
    def _add_conversational_touch(self, answer: str, question: str) -> str:
        """Make the response more human-like and engaging."""
        import random
        
        # Remove robotic phrases
        robotic_phrases = [
            "According to the context",
            "Based on the provided information",
            "The document states that",
            "Per the context"
        ]
        
        for phrase in robotic_phrases:
            if answer.startswith(phrase):
                answer = answer[len(phrase):].strip().capitalize()
                question_lower = question.lower()
                if "how many" in question_lower:
                    answer = f"I found that {answer}"
                elif "what is" in question_lower:
                    answer = f"From what I understand, {answer}"
                elif "where" in question_lower:
                    answer = f"The data mentions that {answer}"
                else:
                    answer = f"I see! {answer}"
        
        # Add follow-up questions naturally (40% chance)
        if random.random() > 0.6:
            follow_ups = [
                "\n\nIs there anything else about this you'd like me to explain?",
                "\n\nWould you like me to look up more details on this topic?",
                "\n\nI can help you explore other aspects if you're interested!",
                "\n\nFeel free to ask if you need clarification on any of this!"
            ]
            answer += random.choice(follow_ups)
        
        return answer
    
    def _calculate_confidence(self, answer: str, context: str) -> float:
        """Calculate confidence score for the answer."""
        import re
        
        # Base confidence
        confidence = 0.8
        
        # Check for uncertainty indicators
        uncertainty_indicators = ["might be", "could be", "perhaps", "maybe", "possibly", "I think", "I believe"]
        uncertainty_count = sum(1 for indicator in uncertainty_indicators if indicator in answer.lower())
        if uncertainty_count > 0:
            confidence -= 0.1 * uncertainty_count
        
        # Check if answer mentions not finding information
        if "couldn't find" in answer.lower() or "not in the context" in answer.lower():
            confidence = 0.3
        
        # Ensure confidence is between 0 and 1
        return max(0.0, min(1.0, confidence))

# Global LLM service instance
llm_service = LLMService()
