import sys
import os

# Add the project root to the path so we can import from backend/
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app
