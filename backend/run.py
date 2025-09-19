#!/usr/bin/env python3
"""
EduQuest Gemini API Server Runner
Run this script to start the backend server
"""

import os
import sys
import subprocess
from pathlib import Path

def check_requirements():
    """Check if all requirements are installed"""
    try:
        import fastapi
        import uvicorn
        import google.generativeai
        import pydantic
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        print("Please create a .env file with your GEMINI_API_KEY")
        print("Example:")
        print("GEMINI_API_KEY=your_api_key_here")
        return False
    
    # Check if API key is set
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found in .env file")
        print("Please add your Gemini API key to the .env file")
        return False
    
    if api_key.startswith("your_api_key") or len(api_key) < 20:
        print("❌ GEMINI_API_KEY appears to be invalid")
        print("Please set a valid Gemini API key in the .env file")
        return False
    
    print("✅ Environment configuration is valid")
    return True

def main():
    """Main function to start the server"""
    print("🚀 Starting EduQuest Gemini API Backend")
    print("=" * 50)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Check environment
    if not check_env_file():
        sys.exit(1)
    
    print("\n📚 Curriculum Coverage:")
    print("- Grades: 8, 9, 10, 11, 12")
    print("- Subjects: Science, Maths, English, Odissi, Technology, Engineering")
    print("- Languages: English, Odia (ଓଡ଼ିଆ), Hindi (हिंदी)")
    print("- Cultural Context: Odisha temples, festivals, traditions")
    
    print("\n🌐 Server Information:")
    print("- URL: http://127.0.0.1:8000")
    print("- API Docs: http://127.0.0.1:8000/docs")
    print("- Health Check: http://127.0.0.1:8000/health")
    
    print("\n🔧 Starting server...")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Start the server
        os.system("python main.py")
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
