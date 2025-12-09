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
                                "If any request violates policy, politely decline."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.3,
                    max_tokens=1500,
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
4. Use natural language with occasional expressions like "I understand", "That's interesting", etc.
5. Admit when you don't know something

CRITICAL GUIDELINES:
1. ALWAYS use ONLY information from the provided context
2. Be precise with numbers and facts - copy them exactly as they appear
3. If you see contradictions in context, mention: "There seems to be some inconsistency in the data"
4. When listing items, present them clearly with bullet points or numbers
5. Use conversational transitions: "Based on the document...", "I found that...", "The data shows..."
6. End with helpful follow-ups: "Is there anything else you'd like to know about this?"

CONTEXT FROM INSTITUTE DATA:
{context}

USER QUESTION:
"{question}"

Response format:
1. Start with acknowledgment if appropriate: "I see you're asking about..."
2. Present the information clearly
3. Add relevant context from other parts if helpful
4. End with an offer for more help

IMPORTANT: If the answer is NOT in the context, say: "I couldn't find specific information about this in the provided data. Could you rephrase or ask about something else?"

Now, provide a helpful, human-like response:
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
