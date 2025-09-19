#!/usr/bin/env python3
"""
Create database tables one by one with proper error handling
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

def create_users_table():
    """Create users table"""
    sql = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
        avatar VARCHAR(255),
        grade INT,
        school VARCHAR(255),
        preferences JSON,
        cultural_background JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
    )
    """
    return sql

def create_sessions_table():
    """Create sessions table"""
    sql = """
    CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
    )
    """
    return sql

def create_game_stats_table():
    """Create game_stats table"""
    sql = """
    CREATE TABLE IF NOT EXISTS game_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        level INT DEFAULT 1,
        total_points INT DEFAULT 0,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        badges JSON,
        achievements JSON,
        subject_progress JSON,
        last_active_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_level (level)
    )
    """
    return sql

def insert_demo_data():
    """Insert demo users"""
    users_sql = """
    INSERT IGNORE INTO users (email, password, name, role, avatar, school, preferences, cultural_background) VALUES
    ('teacher@shiksha.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Teacher', 'teacher', '👩‍🏫', 'SHIKSHA Demo School', 
     '{"language": "en", "theme": "light", "notifications": true, "soundEnabled": true, "reducedMotion": false}',
     '{"region": "Odisha", "language": "Odia", "festivals": ["Rath Yatra", "Durga Puja", "Diwali"]}'),
    ('student@shiksha.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Student', 'student', '👨‍🎓', 'SHIKSHA Demo School',
     '{"language": "od", "theme": "light", "notifications": true, "soundEnabled": true, "reducedMotion": false}',
     '{"region": "Odisha", "language": "Odia", "festivals": ["Rath Yatra", "Durga Puja", "Diwali"]}')
    """
    
    game_stats_sql = """
    INSERT IGNORE INTO game_stats (user_id, level, total_points, badges, achievements, subject_progress)
    SELECT id, 1, 0, '[]', '[]', 
    '{"science": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "technology": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "engineering": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "english": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "maths": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "odissi": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}}'
    FROM users WHERE email IN ('teacher@shiksha.edu', 'student@shiksha.edu')
    """
    
    return [users_sql, game_stats_sql]

def main():
    print("🏗️ Creating SHIKSHA Database Tables")
    print("=" * 40)
    
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        # Create tables one by one
        tables = [
            ("Users", create_users_table()),
            ("Sessions", create_sessions_table()),
            ("Game Stats", create_game_stats_table())
        ]
        
        for table_name, sql in tables:
            try:
                print(f"📋 Creating {table_name} table...")
                cursor.execute(sql)
                print(f"✅ {table_name} table created successfully!")
            except mysql.connector.Error as err:
                print(f"❌ Error creating {table_name} table: {err}")
        
        # Insert demo data
        print("\n👥 Inserting demo data...")
        demo_queries = insert_demo_data()
        
        for i, sql in enumerate(demo_queries, 1):
            try:
                cursor.execute(sql)
                print(f"✅ Demo data {i} inserted successfully!")
            except mysql.connector.Error as err:
                print(f"❌ Error inserting demo data {i}: {err}")
        
        connection.commit()
        
        # Verify tables
        print("\n📊 Verifying tables...")
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        print(f"📋 Tables created: {len(tables)}")
        for table in tables:
            print(f"   📄 {table[0]}")
        
        # Check demo users
        cursor.execute("SELECT email, role FROM users")
        users = cursor.fetchall()
        
        print(f"\n👥 Users created: {len(users)}")
        for user in users:
            print(f"   🎭 {user[0]} ({user[1]})")
        
        cursor.close()
        connection.close()
        
        print("\n🎉 Database setup completed successfully!")
        print("\n📋 Demo Accounts:")
        print("   👩‍🏫 Teacher: teacher@shiksha.edu / teacher123")
        print("   👨‍🎓 Student: student@shiksha.edu / student123")
        
    except Exception as err:
        print(f"❌ Database setup failed: {err}")

if __name__ == "__main__":
    main()
