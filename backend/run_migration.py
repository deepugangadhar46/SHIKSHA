#!/usr/bin/env python3
"""
Database Migration Script for Game Integration System
Runs the game schema migration using the existing database configuration
"""

import os
import sys
from config import get_db_connection, execute_query

def run_migration():
    """Run the game schema migration"""
    try:
        print("🔄 Starting game schema migration...")
        
        # Read the migration SQL file
        migration_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db', 'game-schema-migration.sql')
        
        if not os.path.exists(migration_file):
            print(f"❌ Migration file not found: {migration_file}")
            return False
        
        with open(migration_file, 'r', encoding='utf-8') as f:
            migration_sql = f.read()
        
        # Split SQL statements (basic splitting by semicolon)
        statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
        
        print(f"📝 Found {len(statements)} SQL statements to execute")
        
        # Get database connection
        connection = get_db_connection()
        if not connection:
            print("❌ Failed to get database connection")
            return False
        
        cursor = connection.cursor()
        
        # Execute each statement
        successful_statements = 0
        failed_statements = 0
        
        for i, statement in enumerate(statements, 1):
            try:
                # Skip comments and empty statements
                if statement.startswith('--') or statement.startswith('/*') or len(statement) < 5:
                    continue
                
                print(f"⚡ Executing statement {i}/{len(statements)}: {statement[:50]}...")
                cursor.execute(statement)
                connection.commit()
                successful_statements += 1
                
            except Exception as e:
                error_msg = str(e)
                # Some errors are expected (like table already exists)
                if any(expected in error_msg.lower() for expected in ['already exists', 'duplicate']):
                    print(f"⚠️  Statement {i} - Expected warning: {error_msg}")
                    successful_statements += 1
                else:
                    print(f"❌ Statement {i} failed: {error_msg}")
                    failed_statements += 1
        
        cursor.close()
        connection.close()
        
        print(f"\n📊 Migration Summary:")
        print(f"✅ Successful statements: {successful_statements}")
        print(f"❌ Failed statements: {failed_statements}")
        
        if failed_statements == 0:
            print("🎉 Game schema migration completed successfully!")
            return True
        else:
            print("⚠️  Migration completed with some errors. Check the logs above.")
            return successful_statements > failed_statements
            
    except Exception as e:
        print(f"❌ Migration failed with error: {e}")
        return False

def verify_migration():
    """Verify that the migration was successful by checking for key tables"""
    try:
        print("\n🔍 Verifying migration...")
        
        # Tables that should exist after migration
        expected_tables = [
            'games',
            'game_progress', 
            'game_sessions',
            'achievements',
            'student_achievements',
            'subject_mastery',
            'game_assets',
            'curriculum_cache',
            'offline_sync_queue',
            'learning_analytics'
        ]
        
        connection = get_db_connection()
        if not connection:
            print("❌ Failed to get database connection for verification")
            return False
        
        cursor = connection.cursor()
        
        existing_tables = []
        missing_tables = []
        
        for table in expected_tables:
            try:
                cursor.execute(f"SHOW TABLES LIKE '{table}'")
                result = cursor.fetchone()
                if result:
                    existing_tables.append(table)
                    print(f"✅ Table '{table}' exists")
                else:
                    missing_tables.append(table)
                    print(f"❌ Table '{table}' missing")
            except Exception as e:
                missing_tables.append(table)
                print(f"❌ Error checking table '{table}': {e}")
        
        cursor.close()
        connection.close()
        
        print(f"\n📊 Verification Summary:")
        print(f"✅ Existing tables: {len(existing_tables)}/{len(expected_tables)}")
        print(f"❌ Missing tables: {len(missing_tables)}")
        
        if missing_tables:
            print(f"Missing tables: {', '.join(missing_tables)}")
        
        return len(missing_tables) == 0
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def main():
    """Main function"""
    print("🎮 Game Integration Database Migration Tool")
    print("=" * 50)
    
    # Run migration
    migration_success = run_migration()
    
    if migration_success:
        # Verify migration
        verification_success = verify_migration()
        
        if verification_success:
            print("\n🎉 Game integration system is ready!")
            print("You can now start the game API server with: python backend/game_api.py")
        else:
            print("\n⚠️  Migration completed but verification failed.")
            print("Some tables might be missing. Check the logs above.")
    else:
        print("\n❌ Migration failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
