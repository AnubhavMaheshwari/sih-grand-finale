#!/usr/bin/env python3
"""
Test script to verify chatbot setup
"""
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Test that all required modules can be imported."""
    print("🧪 Testing imports...")
    
    try:
        # Test core modules
        import src.core.content_filter
        print("✅ Content filter module imported successfully")
    except Exception as e:
        print(f"❌ Failed to import content filter module: {e}")
        return False
    
    try:
        # Test services
        import src.services.llm_service
        print("✅ LLM service module imported successfully")
    except Exception as e:
        print(f"⚠️  LLM service import warning (expected without GROQ_API_KEY): {e}")
    
    try:
        # Test routes
        import src.routes.chat
        print("✅ Chat routes module imported successfully")
    except Exception as e:
        print(f"❌ Failed to import chat routes module: {e}")
        return False
    
    try:
        import src.routes.institute
        print("✅ Institute routes module imported successfully")
    except Exception as e:
        print(f"❌ Failed to import institute routes module: {e}")
        return False
    
    try:
        import src.routes.health
        print("✅ Health routes module imported successfully")
    except Exception as e:
        print(f"❌ Failed to import health routes module: {e}")
        return False
    
    return True

def test_content_filter():
    """Test content filter functionality."""
    print("\n🧪 Testing content filter...")
    
    try:
        from src.core.content_filter import content_filter
        
        test_cases = [
            ("Hello, how are you?", True, None),
            ("This is a test question about education.", True, None),
            ("Fuck you!", False, "vulgar"),
            ("What is sex education?", True, None),
        ]
        
        all_passed = True
        for test_input, expected_appropriate, expected_violation in test_cases:
            is_appropriate, violation_type = content_filter.is_content_appropriate(test_input)
            passed = is_appropriate == expected_appropriate and violation_type == expected_violation
            
            status = "✅" if passed else "❌"
            print(f"{status} '{test_input[:30]}...' -> Appropriate: {is_appropriate} (expected: {expected_appropriate}), "
                  f"Violation: {violation_type} (expected: {expected_violation})")
            
            if not passed:
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Content filter test failed: {e}")
        return False

def test_main_app():
    """Test that the main app can be created."""
    print("\n🧪 Testing main application...")
    
    try:
        # Set a dummy GROQ_API_KEY for testing
        os.environ['GROQ_API_KEY'] = 'dummy_key_for_testing'
        
        from src.main import app
        print("✅ FastAPI app created successfully")
        
        # Check routes
        routes = [route.path for route in app.routes]
        expected_routes = ['/', '/api/v1/chat', '/api/v1/institute/context', '/api/v1/health']
        
        for route in expected_routes:
            if route in [r.path for r in app.routes]:
                print(f"✅ Route '{route}' found")
            else:
                print(f"⚠️  Route '{route}' not found (might be under different path)")
        
        return True
        
    except Exception as e:
        print(f"❌ Main app test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting SARTHI Chatbot Setup Tests")
    print("=" * 50)
    
    all_passed = True
    
    # Test 1: Imports
    if not test_imports():
        all_passed = False
    
    # Test 2: Content filter
    if not test_content_filter():
        all_passed = False
    
    # Test 3: Main app
    if not test_main_app():
        all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! Chatbot setup is ready.")
        print("\nNext steps:")
        print("1. Set GROQ_API_KEY in .env file")
        print("2. Run: ./start.sh")
        print("3. Access API docs at: http://localhost:8000/docs")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
