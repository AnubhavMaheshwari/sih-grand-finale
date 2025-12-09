"""
Content filtering system for inappropriate content
Inspired by the original app.py but with cleaner organization
"""
import re
from typing import Set, Pattern, Optional, Tuple

class ContentFilter:
    """Advanced content filtering system for inappropriate content."""
    
    def __init__(self):
        self.vulgar_patterns = self._load_vulgar_patterns()
        self.sexual_patterns = self._load_sexual_patterns()
        self.biasing_patterns = self._load_biasing_patterns()
        self.caste_patterns = self._load_caste_patterns()
        self.offensive_phrases = self._load_offensive_phrases()
        
        # Common Indian caste terms that should be avoided in biased context
        self.caste_terms = {
            'brahmin', 'brahmins', 'brahman', 'brahmins',
            'kshatriya', 'kshatriyas', 'vaishya', 'vaishyas',
            'shudra', 'shudras', 'dalit', 'dalits', 'harijan', 'harijans',
            'scheduled caste', 'sc', 'st', 'obc', 'general caste',
            'reserved category', 'forward caste', 'backward caste',
            'upper caste', 'lower caste', 'bhumihar', 'rajput', 'baniya',
            'kayastha', 'jatt', 'jat', 'gurjar', 'yadav', 'kurmi', 'kunbi',
            'maratha', 'patel', 'reddy', 'naidu', 'vanniyar', 'thevar'
        }
        
        # Allowed contexts for caste discussions (educational/institutional only)
        self.allowed_caste_contexts = {
            'reservation', 'quota', 'policy', 'education', 'admission',
            'college', 'university', 'institution', 'government', 'ministry',
            'percentage', 'seats', 'constitution', 'law', 'rights', 'equality'
        }
    
    def _load_vulgar_patterns(self) -> Set[Pattern]:
        """Load patterns for vulgar/abusive language."""
        patterns = [
            r'\b(fuck|shit|asshole|bastard|bitch|dick|piss|pussy|cunt|whore|slut)\w*\b',
            r'\b(motherfucker|son of a bitch|bloody hell|damn it)\b',
            r'\b(chutiya|bhosdike|madarchod|behenchod|lund|gaand)\w*\b',
            r'\b(randi|kuttiya|kamina|harami|bewakoof)\w*\b',
            r'\b(lauda|gandu|choot|lund|tatti)\w*\b',
            r'\byou (idiot|stupid|dumb|fool|moron)\b',
            r'\b(go to hell|fuck off|piss off|get lost)\b'
        ]
        return {re.compile(pattern, re.IGNORECASE) for pattern in patterns}
    
    def _load_sexual_patterns(self) -> Set[Pattern]:
        """Load patterns for sexual content."""
        patterns = [
            r'\b(sex|sexual|porn|xxx|nude|naked|erotic|masturbat)\w*\b',
            r'\b(rape|molest|harass|abuse|assault)\w*\b',
            r'\b(penis|vagina|breast|butt|boob|clitoris|testicle)\w*\b',
            r'\b(intercourse|orgasm|ejaculation|foreplay|virginity)\w*\b',
            r'\b(prostitute|escort|call girl|sex worker)\b',
            r'\b(hot|sexy|horny|arous\w+|lust\w+|desire)\b',
            r'\b(make love|sleep with|hook up|one night stand)\b'
        ]
        return {re.compile(pattern, re.IGNORECASE) for pattern in patterns}
    
    def _load_biasing_patterns(self) -> Set[Pattern]:
        """Load patterns for biased/discriminatory content."""
        patterns = [
            r'\b(nigger|negro|chink|gook|spic|wetback)\b',
            r'\b(racial superiority|master race|aryan supremacy)\b',
            r'\b(women belong|men are better|female inferior|male superior)\b',
            r'\b(housewife job|working women problems|women drivers)\b',
            r'\b(muslims are|hindus are|christians are|sikhs are|jews are)\b',
            r'\b(terrorist religion|violent religion|peaceful religion)\b',
            r'\b(biharis are|bengalis are|punjabis are|tamilians are)\b',
            r'\b(north indians|south indians|east indians|west indians)\b',
            r'\b(all \w+ are|every \w+ is|typical \w+|always \w+)\b'
        ]
        return {re.compile(pattern, re.IGNORECASE) for pattern in patterns}
    
    def _load_caste_patterns(self) -> Set[Pattern]:
        """Load patterns for caste-based discrimination."""
        patterns = [
            r'\b(upper caste superior|lower caste inferior|dalits are)\b',
            r'\b(untouchable|polluted|impure because of caste)\b',
            r'\b(no \w+ for \w+ caste|reserved for \w+ caste)\b',
            r'\b(caste determines|born into caste means|by birth)\b',
            r'\b(not allowed to|cannot marry|separate because of)\b',
            r'\b(manual scavenging|begging by caste|forced labor)\b'
        ]
        return {re.compile(pattern, re.IGNORECASE) for pattern in patterns}
    
    def _load_offensive_phrases(self) -> Set[str]:
        """Load offensive phrases that need context checking."""
        phrases = {
            "you people", "your kind", "those people", "like them",
            "as expected from", "typical of", "what do you expect from"
        }
        return phrases
    
    def contains_vulgar_content(self, text: str) -> bool:
        """Check for vulgar/abusive language."""
        text_lower = text.lower()
        for pattern in self.vulgar_patterns:
            if pattern.search(text_lower):
                return True
        return False
    
    def contains_sexual_content(self, text: str) -> bool:
        """Check for sexual content."""
        text_lower = text.lower()
        
        # Check for educational context exceptions first
        educational_contexts = [
            "sex education", "sexual education", "health education",
            "reproductive health", "biology class", "science class",
            "educational", "academic", "school", "college", "university",
            "curriculum", "syllabus", "teaching", "learning"
        ]
        
        # If the text contains educational context, be more lenient
        has_educational_context = any(context in text_lower for context in educational_contexts)
        
        for pattern in self.sexual_patterns:
            if pattern.search(text_lower):
                # Check if it's in an educational context
                if has_educational_context:
                    # For educational contexts, only block explicit sexual content
                    explicit_patterns = [
                        r'\b(porn|xxx|nude|naked|erotic|masturbat)\w*\b',
                        r'\b(rape|molest|harass|abuse|assault)\w*\b',
                        r'\b(prostitute|escort|call girl|sex worker)\b',
                        r'\b(hot|sexy|horny|arous\w+|lust\w+|desire)\b',
                        r'\b(make love|sleep with|hook up|one night stand)\b'
                    ]
                    explicit_pattern = any(re.compile(p, re.IGNORECASE).search(text_lower) for p in explicit_patterns)
                    if not explicit_pattern:
                        continue  # Skip this pattern for educational context
                return True
        return False
    
    def contains_biasing_content(self, text: str) -> bool:
        """Check for biased/discriminatory content."""
        text_lower = text.lower()
        
        # Check patterns
        for pattern in self.biasing_patterns:
            if pattern.search(text_lower):
                return True
        
        # Check offensive phrases
        for phrase in self.offensive_phrases:
            if phrase in text_lower:
                return True
        
        # Check for harmful generalizations
        words = text_lower.split()
        if len(words) > 4:
            if "all" in words and "are" in words:
                all_index = words.index("all")
                if all_index < len(words) - 2:
                    if words[all_index + 2] == "are":
                        return True
        
        return False
    
    def contains_caste_discrimination(self, text: str) -> bool:
        """Check for caste-based discrimination."""
        text_lower = text.lower()
        
        # Check explicit caste discrimination patterns
        for pattern in self.caste_patterns:
            if pattern.search(text_lower):
                return True
        
        # Check for caste terms in negative context
        for caste_term in self.caste_terms:
            if caste_term in text_lower:
                # Look for negative context around caste term
                words = text_lower.split()
                try:
                    idx = words.index(caste_term)
                    # Check surrounding words for negativity
                    context_words = words[max(0, idx-3):min(len(words), idx+4)]
                    negative_indicators = {'bad', 'poor', 'inferior', 'superior', 'dirty', 
                                         'clean', 'high', 'low', 'upper', 'lower', 'cannot',
                                         'should not', 'must not', 'avoid', 'hate', 'dislike'}
                    
                    if any(indicator in context_words for indicator in negative_indicators):
                        # Check if it's in an educational context (allowed)
                        if not any(context in text_lower for context in self.allowed_caste_contexts):
                            return True
                except ValueError:
                    continue
        
        return False
    
    def is_content_appropriate(self, text: str) -> Tuple[bool, Optional[str]]:
        """
        Check if content is appropriate.
        Returns: (is_appropriate, violation_type)
        """
        if self.contains_vulgar_content(text):
            return False, "vulgar"
        
        if self.contains_sexual_content(text):
            return False, "sexual"
        
        if self.contains_biasing_content(text):
            return False, "biasing"
        
        if self.contains_caste_discrimination(text):
            return False, "caste"
        
        return True, None
    
    def get_policy_violation_response(self, violation_type: str) -> str:
        """Get appropriate response for policy violation."""
        responses = {
            "vulgar": "I apologize, but I cannot respond to questions containing vulgar or abusive language. My purpose is to provide helpful, respectful educational assistance.",
            "sexual": "I'm sorry, but I cannot engage with questions of a sexual nature. I'm designed to assist with educational institution analysis and related academic queries.",
            "biasing": "I cannot respond to questions that promote bias, discrimination, or stereotypes. My goal is to provide objective, fair educational information.",
            "caste": "I do not engage with questions that promote caste-based discrimination or bias. I'm committed to providing equitable educational assistance to everyone.",
        }
        
        default_response = "I'm sorry, but this question violates my content policy. I'm designed to provide respectful, unbiased educational assistance."
        
        return responses.get(violation_type, default_response)

# Global content filter instance
content_filter = ContentFilter()
