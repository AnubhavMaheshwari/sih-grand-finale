import sys
import os

# Simulate path setup in run.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

print("CWD:", os.getcwd())
print("sys.path:", sys.path)

try:
    import services.llm_service
    print("Successfully imported services.llm_service")
    from services.llm_service import llm_service
    print("Successfully imported llm_service INSTANCE")
except Exception as e:
    print("Failed to import services.llm_service:", e)
    import traceback
    traceback.print_exc()

try:
    # This simulates how run.py imports it
    from src.main import app
    print("Successfully imported src.main.app")
except Exception as e:
    print("Failed to import src.main.app:", e)
    import traceback
    traceback.print_exc()
