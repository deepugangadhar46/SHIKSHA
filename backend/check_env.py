#!/usr/bin/env python3
"""
Check environment variables and connection details
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_env_vars():
    """Check all database environment variables"""
    print("🔍 Checking Environment Variables")
    print("=" * 40)
    
    env_vars = [
        'DATABASE_HOST',
        'DATABASE_PORT', 
        'DATABASE_USER',
        'DATABASE_PASSWORD',
        'DATABASE_NAME',
        'CA_CERT_PATH'
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if var == 'DATABASE_PASSWORD':
            # Mask password for security
            masked_value = value[:4] + '*' * (len(value) - 4) if value else None
            print(f"📋 {var}: {masked_value}")
        else:
            print(f"📋 {var}: {value}")
    
    print("\n🔍 Checking Certificate File")
    cert_path = os.getenv('CA_CERT_PATH', 'S:\\projects\\windsursih\\TOOLS\\ca(1).pem')
    print(f"📜 Certificate path: {cert_path}")
    print(f"📁 File exists: {os.path.exists(cert_path)}")
    
    # Try alternative path
    alt_cert_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'TOOLS', 'ca (1).pem')
    print(f"📜 Alternative path: {alt_cert_path}")
    print(f"📁 Alt file exists: {os.path.exists(alt_cert_path)}")

def show_connection_string():
    """Show the connection string format"""
    print("\n🔗 Connection Details from .env:")
    print("=" * 40)
    
    host = os.getenv('DATABASE_HOST', 'Not set')
    port = os.getenv('DATABASE_PORT', 'Not set')
    user = os.getenv('DATABASE_USER', 'Not set')
    password = os.getenv('DATABASE_PASSWORD', 'Not set')
    database = os.getenv('DATABASE_NAME', 'Not set')
    
    # Mask password
    masked_password = password[:4] + '*' * (len(password) - 4) if password != 'Not set' else 'Not set'
    
    print(f"🏠 Host: {host}")
    print(f"🚪 Port: {port}")
    print(f"👤 User: {user}")
    print(f"🔐 Password: {masked_password}")
    print(f"🗄️ Database: {database}")
    
    if all(v != 'Not set' for v in [host, port, user, password, database]):
        print("\n✅ All required environment variables are set!")
    else:
        print("\n❌ Some environment variables are missing!")
        print("💡 Make sure your .env file is in the backend/ directory")

if __name__ == "__main__":
    check_env_vars()
    show_connection_string()
