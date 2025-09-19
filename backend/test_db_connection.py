#!/usr/bin/env python3
"""
Test script to verify MySQL database connection using the configuration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import get_db_connection, execute_query, DATABASE_CONFIG
import mysql.connector

def test_basic_connection():
    """Test basic database connection"""
    print("🔍 Testing basic database connection...")
    
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            print("✅ Database connection successful!")
            
            # Get database info
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE(), USER(), VERSION()")
            result = cursor.fetchone()
            
            print(f"📊 Connected to database: {result[0]}")
            print(f"👤 Connected as user: {result[1]}")
            print(f"🗄️ MySQL version: {result[2]}")
            
            cursor.close()
            connection.close()
            return True
        else:
            print("❌ Failed to establish database connection")
            return False
            
    except mysql.connector.Error as err:
        print(f"❌ Database connection error: {err}")
        return False

def test_query_execution():
    """Test query execution using helper function"""
    print("\n🔍 Testing query execution...")
    
    try:
        # Test SELECT query
        result = execute_query("SELECT 1 as test_value, NOW() as current_time", fetch=True)
        if result:
            print("✅ Query execution successful!")
            print(f"📊 Test result: {result}")
            return True
        else:
            print("❌ Query execution failed")
            return False
            
    except Exception as err:
        print(f"❌ Query execution error: {err}")
        return False

def test_table_creation():
    """Test creating a simple test table"""
    print("\n🔍 Testing table operations...")
    
    try:
        # Create test table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS test_connection (
            id INT AUTO_INCREMENT PRIMARY KEY,
            test_message VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        
        result = execute_query(create_table_query)
        if result is not None:
            print("✅ Test table created successfully!")
            
            # Insert test data
            insert_query = "INSERT INTO test_connection (test_message) VALUES (%s)"
            result = execute_query(insert_query, ("Connection test successful!",))
            
            if result:
                print("✅ Test data inserted successfully!")
                
                # Fetch test data
                select_query = "SELECT * FROM test_connection ORDER BY id DESC LIMIT 1"
                result = execute_query(select_query, fetch=True)
                
                if result:
                    print(f"✅ Test data retrieved: {result}")
                    
                    # Clean up test table
                    cleanup_query = "DROP TABLE test_connection"
                    execute_query(cleanup_query)
                    print("✅ Test table cleaned up!")
                    
                    return True
        
        print("❌ Table operations failed")
        return False
        
    except Exception as err:
        print(f"❌ Table operations error: {err}")
        return False

def show_database_config():
    """Display current database configuration (without sensitive data)"""
    print("\n📋 Current Database Configuration:")
    print(f"🏠 Host: {DATABASE_CONFIG['host']}")
    print(f"🚪 Port: {DATABASE_CONFIG['port']}")
    print(f"👤 User: {DATABASE_CONFIG['user']}")
    print(f"🗄️ Database: {DATABASE_CONFIG['database']}")
    print(f"🔒 SSL Enabled: {not DATABASE_CONFIG['ssl_disabled']}")
    print(f"📜 SSL CA Path: {DATABASE_CONFIG['ssl_ca']}")

def main():
    """Run all database tests"""
    print("🚀 SHIKSHA Database Connection Test")
    print("=" * 50)
    
    show_database_config()
    
    # Run tests
    tests = [
        ("Basic Connection", test_basic_connection),
        ("Query Execution", test_query_execution),
        ("Table Operations", test_table_creation)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name} test...")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} test failed!")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your database is ready to use.")
    else:
        print("⚠️ Some tests failed. Please check your database configuration.")
        print("\n🔧 Troubleshooting tips:")
        print("1. Verify your Aiven MySQL credentials in .env file")
        print("2. Check if your IP is whitelisted in Aiven console")
        print("3. Ensure SSL certificate path is correct")
        print("4. Verify your database exists and is accessible")

if __name__ == "__main__":
    main()
