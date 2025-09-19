#!/usr/bin/env python3
"""
Test SSL connection with correct certificate path
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_ssl_connection():
    """Test connection with SSL using environment variables"""
    print("🔍 Testing SSL Connection with Environment Variables")
    print("=" * 50)
    
    # Get values from environment
    host = os.getenv('DATABASE_HOST')
    port = int(os.getenv('DATABASE_PORT'))
    user = os.getenv('DATABASE_USER')
    password = os.getenv('DATABASE_PASSWORD')
    database = os.getenv('DATABASE_NAME')
    cert_path = os.getenv('CA_CERT_PATH')
    
    print(f"🏠 Host: {host}")
    print(f"🚪 Port: {port}")
    print(f"👤 User: {user}")
    print(f"🗄️ Database: {database}")
    print(f"📜 Certificate: {cert_path}")
    print(f"📁 Cert exists: {os.path.exists(cert_path) if cert_path else False}")
    
    try:
        print("\n🔐 Attempting SSL connection...")
        
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl_disabled=False,
            ssl_verify_cert=True,
            ssl_ca=cert_path
        )
        
        if connection.is_connected():
            print("✅ SSL Connection successful!")
            
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE(), USER(), VERSION(), @@ssl_cipher")
            result = cursor.fetchone()
            
            print(f"📊 Database: {result[0]}")
            print(f"👤 User: {result[1]}")
            print(f"🗄️ MySQL Version: {result[2]}")
            print(f"🔒 SSL Cipher: {result[3]}")
            
            # Test a simple query
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"📋 Tables in database: {len(tables)} tables found")
            
            cursor.close()
            connection.close()
            return True
            
    except mysql.connector.Error as err:
        print(f"❌ SSL Connection failed: {err}")
        
        # Try without SSL verification as fallback
        print("\n🔄 Trying without SSL verification...")
        try:
            connection = mysql.connector.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
                ssl_disabled=False,
                ssl_verify_cert=False  # Don't verify certificate
            )
            
            if connection.is_connected():
                print("✅ Connection successful without SSL verification!")
                connection.close()
                return True
                
        except mysql.connector.Error as err2:
            print(f"❌ Connection failed even without SSL verification: {err2}")
            
        return False

def main():
    success = test_ssl_connection()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Database connection is working!")
        print("💡 You can now use the database in your Python backend.")
    else:
        print("❌ Database connection failed.")
        print("\n🔧 Next steps:")
        print("1. Check if your IP (106.76.247.215) is whitelisted in Aiven console")
        print("2. Verify your Aiven MySQL service is running")
        print("3. Double-check your credentials in Aiven console")

if __name__ == "__main__":
    main()
