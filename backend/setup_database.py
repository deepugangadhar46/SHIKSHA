#!/usr/bin/env python3
"""
Setup database tables using the SQL schema
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_connection():
    """Get database connection"""
    return mysql.connector.connect(
        host=os.getenv('DATABASE_HOST'),
        port=int(os.getenv('DATABASE_PORT')),
        user=os.getenv('DATABASE_USER'),
        password=os.getenv('DATABASE_PASSWORD'),
        database=os.getenv('DATABASE_NAME'),
        ssl_disabled=False,
        ssl_verify_cert=True,
        ssl_ca=os.getenv('CA_CERT_PATH')
    )

def setup_tables():
    """Create all required tables"""
    print("🚀 Setting up SHIKSHA database tables...")
    print("=" * 50)
    
    # Read schema file
    schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db', 'schema.sql')
    
    if not os.path.exists(schema_path):
        print(f"❌ Schema file not found at: {schema_path}")
        return False
    
    try:
        with open(schema_path, 'r', encoding='utf-8') as file:
            schema_sql = file.read()
        
        print(f"📋 Schema file loaded: {len(schema_sql)} characters")
        
        # Connect to database
        connection = get_connection()
        cursor = connection.cursor()
        
        # Split SQL into individual statements
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        
        print(f"📊 Found {len(statements)} SQL statements")
        
        # Execute each statement
        for i, statement in enumerate(statements, 1):
            if statement.upper().startswith(('CREATE', 'INSERT', 'ALTER')):
                try:
                    cursor.execute(statement)
                    print(f"✅ Statement {i}: Success")
                except mysql.connector.Error as err:
                    print(f"⚠️ Statement {i}: {err}")
        
        connection.commit()
        
        # Verify tables were created
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        print(f"\n📋 Tables created: {len(tables)}")
        for table in tables:
            print(f"   📄 {table[0]}")
        
        cursor.close()
        connection.close()
        
        print("\n🎉 Database setup completed successfully!")
        return True
        
    except Exception as err:
        print(f"❌ Database setup failed: {err}")
        return False

def verify_demo_data():
    """Verify demo data was inserted"""
    print("\n🔍 Verifying demo data...")
    
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Check users table
        cursor.execute("SELECT COUNT(*) as count FROM users")
        user_count = cursor.fetchone()['count']
        print(f"👥 Users: {user_count}")
        
        # Check demo accounts
        cursor.execute("SELECT email, role FROM users WHERE email LIKE '%@shiksha.edu'")
        demo_users = cursor.fetchall()
        
        for user in demo_users:
            print(f"   🎭 {user['email']} ({user['role']})")
        
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as err:
        print(f"❌ Demo data verification failed: {err}")
        return False

def main():
    print("🏗️ SHIKSHA Database Setup")
    print("=" * 30)
    
    # Setup tables
    if setup_tables():
        # Verify demo data
        verify_demo_data()
        
        print("\n" + "=" * 50)
        print("🎉 Your database is ready!")
        print("\n📋 Demo Accounts Created:")
        print("   👩‍🏫 Teacher: teacher@shiksha.edu / teacher123")
        print("   👨‍🎓 Student: student@shiksha.edu / student123")
        print("\n🚀 You can now start your applications:")
        print("   🐍 Python Backend: python backend/app.py")
        print("   ⚛️ Next.js Frontend: npm run dev")
    else:
        print("\n❌ Database setup failed!")
        print("💡 Try running the SQL manually in your Aiven console")

if __name__ == "__main__":
    main()
