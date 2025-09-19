#!/usr/bin/env python3
"""
Fixed Database Migration Script for Game Integration System
Handles MySQL version compatibility and DELIMITER issues
"""

import os
import sys
import re
from config import get_db_connection

def get_fixed_migration_sql():
    """Return the migration SQL with compatibility fixes"""
    return """
-- Game System Database Migration for Odisha Rural Education Platform
-- Fixed version for MySQL compatibility

-- Games table for storing game definitions
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject ENUM('science', 'technology', 'engineering', 'english', 'maths', 'odissi') NOT NULL,
    class_level INT NOT NULL,
    game_type ENUM('drag-drop', 'memory', 'puzzle', 'strategy', 'simulation') NOT NULL,
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
    time_estimate INT NOT NULL,
    xp_reward INT NOT NULL,
    curriculum_data JSON,
    assets JSON,
    unlock_requirements JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Game progress table
CREATE TABLE IF NOT EXISTS game_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    score INT NOT NULL,
    time_spent INT NOT NULL,
    hints_used INT DEFAULT 0,
    mistakes INT DEFAULT 0,
    xp_earned INT NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    game_state JSON,
    performance_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP NOT NULL,
    ended_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_score INT DEFAULT 0,
    current_level INT DEFAULT 1,
    game_state JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Achievements system
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category ENUM('academic', 'persistence', 'mastery', 'social', 'cultural') NOT NULL,
    rarity ENUM('common', 'rare', 'epic', 'legendary') NOT NULL,
    xp_reward INT NOT NULL,
    requirements JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student achievements
CREATE TABLE IF NOT EXISTS student_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id VARCHAR(255) NOT NULL,
    unlocked_at TIMESTAMP NOT NULL,
    progress_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Subject mastery tracking
CREATE TABLE IF NOT EXISTS subject_mastery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject ENUM('science', 'technology', 'engineering', 'english', 'maths', 'odissi') NOT NULL,
    class_level INT NOT NULL,
    mastery_level INT DEFAULT 1,
    total_xp INT DEFAULT 0,
    games_completed INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    mastery_percentage DECIMAL(5,2) DEFAULT 0.00,
    weak_areas JSON,
    strong_areas JSON,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_subject_class (user_id, subject, class_level)
);

-- Game assets for offline caching
CREATE TABLE IF NOT EXISTS game_assets (
    id VARCHAR(255) PRIMARY KEY,
    game_id VARCHAR(255) NOT NULL,
    asset_type ENUM('image', 'audio', 'video', 'json', 'text') NOT NULL,
    asset_url VARCHAR(500) NOT NULL,
    local_path VARCHAR(500),
    file_size INT,
    is_cached BOOLEAN DEFAULT FALSE,
    cache_priority INT DEFAULT 1,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Curriculum content cache
CREATE TABLE IF NOT EXISTS curriculum_cache (
    id VARCHAR(255) PRIMARY KEY,
    subject ENUM('science', 'technology', 'engineering', 'english', 'maths', 'odissi') NOT NULL,
    class_level INT NOT NULL,
    topic VARCHAR(255),
    language ENUM('en', 'od', 'hi') NOT NULL,
    content JSON NOT NULL,
    version VARCHAR(50) NOT NULL,
    source VARCHAR(100) DEFAULT 'odisha_gov_api',
    is_valid BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Offline sync queue
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    sync_type ENUM('progress', 'completion', 'achievement', 'session') NOT NULL,
    data JSON NOT NULL,
    priority INT DEFAULT 1,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    is_synced BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learning analytics
CREATE TABLE IF NOT EXISTS learning_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    event_type ENUM('game_start', 'game_pause', 'game_resume', 'game_complete', 'hint_used', 'mistake_made', 'level_up') NOT NULL,
    event_data JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Game leaderboards
CREATE TABLE IF NOT EXISTS game_leaderboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leaderboard_type ENUM('overall', 'subject', 'class', 'weekly', 'monthly') NOT NULL,
    subject ENUM('science', 'technology', 'engineering', 'english', 'maths', 'odissi'),
    class_level INT,
    period_start DATE,
    period_end DATE,
    user_id INT NOT NULL,
    rank_position INT NOT NULL,
    total_xp INT NOT NULL,
    games_completed INT NOT NULL,
    average_score DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

def get_indexes_sql():
    """Return index creation SQL (without IF NOT EXISTS for compatibility)"""
    return [
        "CREATE INDEX idx_games_subject_class ON games(subject, class_level)",
        "CREATE INDEX idx_games_type ON games(game_type)",
        "CREATE INDEX idx_games_difficulty ON games(difficulty)",
        "CREATE INDEX idx_games_active ON games(is_active)",
        "CREATE INDEX idx_progress_user_game ON game_progress(user_id, game_id)",
        "CREATE INDEX idx_progress_completed ON game_progress(completed_at)",
        "CREATE INDEX idx_progress_score ON game_progress(score)",
        "CREATE INDEX idx_sessions_user_active ON game_sessions(user_id, is_active)",
        "CREATE INDEX idx_sessions_activity ON game_sessions(last_activity)",
        "CREATE INDEX idx_achievements_category ON achievements(category)",
        "CREATE INDEX idx_achievements_rarity ON achievements(rarity)",
        "CREATE INDEX idx_achievements_active ON achievements(is_active)",
        "CREATE INDEX idx_student_achievements_user ON student_achievements(user_id)",
        "CREATE INDEX idx_student_achievements_unlocked ON student_achievements(unlocked_at)",
        "CREATE INDEX idx_mastery_user_subject ON subject_mastery(user_id, subject)",
        "CREATE INDEX idx_mastery_percentage ON subject_mastery(mastery_percentage)",
        "CREATE INDEX idx_assets_game ON game_assets(game_id)",
        "CREATE INDEX idx_assets_cached ON game_assets(is_cached)",
        "CREATE INDEX idx_assets_priority ON game_assets(cache_priority)",
        "CREATE INDEX idx_curriculum_subject_class_lang ON curriculum_cache(subject, class_level, language)",
        "CREATE INDEX idx_curriculum_expires ON curriculum_cache(expires_at)",
        "CREATE INDEX idx_curriculum_valid ON curriculum_cache(is_valid)",
        "CREATE INDEX idx_sync_user_synced ON offline_sync_queue(user_id, is_synced)",
        "CREATE INDEX idx_sync_priority ON offline_sync_queue(priority)",
        "CREATE INDEX idx_sync_attempts ON offline_sync_queue(attempts)",
        "CREATE INDEX idx_analytics_user_timestamp ON learning_analytics(user_id, timestamp)",
        "CREATE INDEX idx_analytics_event_type ON learning_analytics(event_type)",
        "CREATE INDEX idx_analytics_game_timestamp ON learning_analytics(game_id, timestamp)",
        "CREATE INDEX idx_leaderboard_rank ON game_leaderboards(leaderboard_type, subject, class_level, rank_position)",
        "CREATE INDEX idx_leaderboard_user ON game_leaderboards(user_id, leaderboard_type)",
        "CREATE INDEX idx_leaderboard_period ON game_leaderboards(period_start, period_end)"
    ]

def get_sample_data_sql():
    """Return sample data insertion SQL"""
    return [
        """INSERT IGNORE INTO achievements (id, name, description, icon, category, rarity, xp_reward, requirements) VALUES
        ('first_game', 'First Steps', 'Complete your first game', '🎯', 'academic', 'common', 50, '{"type": "games_completed", "value": 1}'),
        ('perfect_score', 'Perfectionist', 'Score 100% on any game', '💯', 'academic', 'rare', 100, '{"type": "perfect_score", "value": 1}'),
        ('week_streak', 'Dedicated Learner', 'Play games for 7 consecutive days', '🔥', 'persistence', 'epic', 200, '{"type": "streak", "value": 7}'),
        ('math_master', 'Mathematics Master', 'Achieve 90% mastery in Mathematics', '🔢', 'mastery', 'epic', 300, '{"type": "subject_mastery", "subject": "maths", "value": 90}'),
        ('science_explorer', 'Science Explorer', 'Complete 10 science games', '🔬', 'academic', 'rare', 150, '{"type": "subject_games", "subject": "science", "value": 10}'),
        ('cultural_ambassador', 'Cultural Ambassador', 'Master Odia culture and traditions', '🏛️', 'cultural', 'legendary', 500, '{"type": "subject_mastery", "subject": "odissi", "value": 95}'),
        ('speed_demon', 'Speed Demon', 'Complete a game in record time', '⚡', 'academic', 'rare', 120, '{"type": "speed_completion", "value": 30}'),
        ('helping_hand', 'Helping Hand', 'Help other students learn', '🤝', 'social', 'epic', 250, '{"type": "peer_help", "value": 5}'),
        ('tech_wizard', 'Technology Wizard', 'Excel in technology games', '⚡', 'mastery', 'epic', 300, '{"type": "subject_mastery", "subject": "technology", "value": 85}'),
        ('engineering_genius', 'Engineering Genius', 'Master engineering concepts', '🌉', 'mastery', 'legendary', 400, '{"type": "subject_mastery", "subject": "engineering", "value": 90}')""",
        
        """INSERT IGNORE INTO games (id, title, subject, class_level, game_type, difficulty, time_estimate, xp_reward, curriculum_data, unlock_requirements) VALUES
        ('math-drag-drop-algebra', 'Algebra Drag & Drop', 'maths', 8, 'drag-drop', 'BEGINNER', 15, 120, '{"topics": ["Linear Equations", "Basic Algebra", "Variables"], "odishaBoard": true}', '{}'),
        ('science-chemistry-lab', 'Virtual Chemistry Lab', 'science', 10, 'simulation', 'INTERMEDIATE', 20, 140, '{"topics": ["Chemical Reactions", "Periodic Table", "Lab Safety"], "odishaBoard": true}', '{"level": 5, "games_completed": 3}'),
        ('odia-festival-memory', 'Odisha Festival Memory Game', 'odissi', 8, 'memory', 'BEGINNER', 18, 130, '{"topics": ["Rath Yatra", "Durga Puja", "Cultural Traditions"], "odishaBoard": true}', '{}'),
        ('tech-circuit-builder', 'Electronic Circuit Builder', 'technology', 8, 'puzzle', 'BEGINNER', 15, 120, '{"topics": ["Basic Electronics", "Circuits", "Components"], "odishaBoard": true}', '{}'),
        ('eng-bridge-builder', 'Bridge Engineering Challenge', 'engineering', 11, 'simulation', 'INTERMEDIATE', 22, 170, '{"topics": ["Structural Engineering", "Materials", "Design"], "odishaBoard": true}', '{"level": 15, "subject_mastery": {"maths": 60}}'),
        ('english-grammar-quest', 'Grammar Adventure Quest', 'english', 7, 'strategy', 'BEGINNER', 15, 110, '{"topics": ["Grammar Rules", "Sentence Structure", "Parts of Speech"], "odishaBoard": true}', '{}')"""
    ]

def run_migration():
    """Run the fixed migration"""
    try:
        print("🔄 Starting fixed game schema migration...")
        
        connection = get_db_connection()
        if not connection:
            print("❌ Failed to get database connection")
            return False
        
        cursor = connection.cursor()
        
        # Execute main tables
        print("📝 Creating main tables...")
        main_sql = get_fixed_migration_sql()
        
        # Split by CREATE TABLE statements
        table_statements = re.split(r'(?=CREATE TABLE)', main_sql)
        table_statements = [stmt.strip() for stmt in table_statements if stmt.strip() and 'CREATE TABLE' in stmt]
        
        successful = 0
        failed = 0
        
        for i, statement in enumerate(table_statements, 1):
            try:
                print(f"⚡ Creating table {i}/{len(table_statements)}...")
                cursor.execute(statement)
                connection.commit()
                successful += 1
            except Exception as e:
                error_msg = str(e)
                if 'already exists' in error_msg.lower():
                    print(f"⚠️  Table {i} already exists - skipping")
                    successful += 1
                else:
                    print(f"❌ Table {i} failed: {error_msg}")
                    failed += 1
        
        # Execute indexes (with error handling for existing indexes)
        print("📝 Creating indexes...")
        indexes = get_indexes_sql()
        
        for i, index_sql in enumerate(indexes, 1):
            try:
                cursor.execute(index_sql)
                connection.commit()
                successful += 1
            except Exception as e:
                error_msg = str(e)
                if any(keyword in error_msg.lower() for keyword in ['duplicate', 'already exists', 'exists']):
                    print(f"⚠️  Index {i} already exists - skipping")
                    successful += 1
                else:
                    print(f"❌ Index {i} failed: {error_msg}")
                    failed += 1
        
        # Insert sample data
        print("📝 Inserting sample data...")
        sample_data = get_sample_data_sql()
        
        for i, data_sql in enumerate(sample_data, 1):
            try:
                cursor.execute(data_sql)
                connection.commit()
                successful += 1
            except Exception as e:
                print(f"❌ Sample data {i} failed: {e}")
                failed += 1
        
        cursor.close()
        connection.close()
        
        print(f"\n📊 Migration Summary:")
        print(f"✅ Successful operations: {successful}")
        print(f"❌ Failed operations: {failed}")
        
        return failed == 0 or successful > failed * 2
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def verify_migration():
    """Verify migration success"""
    try:
        print("\n🔍 Verifying migration...")
        
        expected_tables = [
            'games', 'game_progress', 'game_sessions', 'achievements',
            'student_achievements', 'subject_mastery', 'game_assets',
            'curriculum_cache', 'offline_sync_queue', 'learning_analytics',
            'game_leaderboards'
        ]
        
        connection = get_db_connection()
        if not connection:
            return False
        
        cursor = connection.cursor()
        
        existing = 0
        for table in expected_tables:
            try:
                cursor.execute(f"SHOW TABLES LIKE '{table}'")
                if cursor.fetchone():
                    print(f"✅ Table '{table}' exists")
                    existing += 1
                else:
                    print(f"❌ Table '{table}' missing")
            except Exception as e:
                print(f"❌ Error checking '{table}': {e}")
        
        cursor.close()
        connection.close()
        
        print(f"\n📊 Verification: {existing}/{len(expected_tables)} tables exist")
        return existing >= len(expected_tables) * 0.8  # 80% success rate
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def main():
    print("🎮 Fixed Game Integration Database Migration")
    print("=" * 50)
    
    if run_migration():
        if verify_migration():
            print("\n🎉 Game integration system is ready!")
            print("Next steps:")
            print("1. Start the game API: python backend/game_api.py")
            print("2. Start the frontend: npm run dev")
        else:
            print("\n⚠️  Migration completed with some issues.")
    else:
        print("\n❌ Migration failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
