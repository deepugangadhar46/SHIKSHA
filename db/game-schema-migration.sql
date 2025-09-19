-- Game System Database Migration for Odisha Rural Education Platform
-- Extends existing schema to support comprehensive game integration
-- Run this after the main schema.sql to add game-specific tables

-- Games table for storing game definitions
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject ENUM('science', 'technology', 'engineering', 'english', 'maths', 'odissi') NOT NULL,
    class_level INT NOT NULL,
    game_type ENUM('drag-drop', 'memory', 'puzzle', 'strategy', 'simulation') NOT NULL,
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
    time_estimate INT NOT NULL, -- in minutes
    xp_reward INT NOT NULL,
    curriculum_data JSON, -- Curriculum content and game-specific data
    assets JSON, -- Game asset information
    unlock_requirements JSON, -- Requirements to unlock this game
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subject_class (subject, class_level),
    INDEX idx_game_type (game_type),
    INDEX idx_difficulty (difficulty),
    INDEX idx_active (is_active)
);

-- Game progress table (extends existing lesson_progress)
CREATE TABLE IF NOT EXISTS game_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255), -- For tracking individual game sessions
    score INT NOT NULL,
    time_spent INT NOT NULL, -- in seconds
    hints_used INT DEFAULT 0,
    mistakes INT DEFAULT 0,
    xp_earned INT NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    game_state JSON, -- Save game state for resuming
    performance_data JSON, -- Detailed performance metrics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_user_game (user_id, game_id),
    INDEX idx_completed_at (completed_at),
    INDEX idx_score (score)
);

-- Game sessions for tracking active/paused games
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
    game_state JSON, -- Current game state for resuming
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_last_activity (last_activity)
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
    requirements JSON NOT NULL, -- Achievement requirements
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_rarity (rarity),
    INDEX idx_active (is_active)
);

-- Student achievements (many-to-many)
CREATE TABLE IF NOT EXISTS student_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id VARCHAR(255) NOT NULL,
    unlocked_at TIMESTAMP NOT NULL,
    progress_data JSON, -- Data that led to achievement
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_unlocked_at (unlocked_at)
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
    weak_areas JSON, -- Areas where student struggles
    strong_areas JSON, -- Areas where student excels
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_subject_class (user_id, subject, class_level),
    INDEX idx_user_subject (user_id, subject),
    INDEX idx_mastery_percentage (mastery_percentage)
);

-- Game assets for offline caching
CREATE TABLE IF NOT EXISTS game_assets (
    id VARCHAR(255) PRIMARY KEY,
    game_id VARCHAR(255) NOT NULL,
    asset_type ENUM('image', 'audio', 'video', 'json', 'text') NOT NULL,
    asset_url VARCHAR(500) NOT NULL,
    local_path VARCHAR(500), -- Path in local cache
    file_size INT, -- Size in bytes
    is_cached BOOLEAN DEFAULT FALSE,
    cache_priority INT DEFAULT 1, -- 1=high, 2=medium, 3=low
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_cached (is_cached),
    INDEX idx_priority (cache_priority)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subject_class_lang (subject, class_level, language),
    INDEX idx_expires_at (expires_at),
    INDEX idx_valid (is_valid)
);

-- Offline sync queue
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    sync_type ENUM('progress', 'completion', 'achievement', 'session') NOT NULL,
    data JSON NOT NULL,
    priority INT DEFAULT 1, -- 1=high, 2=medium, 3=low
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    is_synced BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sync (user_id, is_synced),
    INDEX idx_priority (priority),
    INDEX idx_attempts (attempts)
);

-- Learning analytics for teachers and government reporting
CREATE TABLE IF NOT EXISTS learning_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    event_type ENUM('game_start', 'game_pause', 'game_resume', 'game_complete', 'hint_used', 'mistake_made', 'level_up') NOT NULL,
    event_data JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_user_timestamp (user_id, timestamp),
    INDEX idx_event_type (event_type),
    INDEX idx_game_timestamp (game_id, timestamp)
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_leaderboard_rank (leaderboard_type, subject, class_level, rank_position),
    INDEX idx_user_leaderboard (user_id, leaderboard_type),
    INDEX idx_period (period_start, period_end)
);

-- Update existing game_stats table to include new fields
ALTER TABLE game_stats 
ADD COLUMN IF NOT EXISTS games_completed INT DEFAULT 0 AFTER total_points,
ADD COLUMN IF NOT EXISTS average_score DECIMAL(5,2) DEFAULT 0.00 AFTER games_completed,
ADD COLUMN IF NOT EXISTS total_time_spent INT DEFAULT 0 AFTER average_score,
ADD COLUMN IF NOT EXISTS favorite_subject VARCHAR(50) AFTER total_time_spent,
ADD COLUMN IF NOT EXISTS learning_streak_days INT DEFAULT 0 AFTER favorite_subject,
ADD COLUMN IF NOT EXISTS offline_games_played INT DEFAULT 0 AFTER learning_streak_days;

-- Insert default achievements
INSERT IGNORE INTO achievements (id, name, description, icon, category, rarity, xp_reward, requirements) VALUES
('first_game', 'First Steps', 'Complete your first game', '🎯', 'academic', 'common', 50, '{"type": "games_completed", "value": 1}'),
('perfect_score', 'Perfectionist', 'Score 100% on any game', '💯', 'academic', 'rare', 100, '{"type": "perfect_score", "value": 1}'),
('week_streak', 'Dedicated Learner', 'Play games for 7 consecutive days', '🔥', 'persistence', 'epic', 200, '{"type": "streak", "value": 7}'),
('math_master', 'Mathematics Master', 'Achieve 90% mastery in Mathematics', '🔢', 'mastery', 'epic', 300, '{"type": "subject_mastery", "subject": "maths", "value": 90}'),
('science_explorer', 'Science Explorer', 'Complete 10 science games', '🔬', 'academic', 'rare', 150, '{"type": "subject_games", "subject": "science", "value": 10}'),
('cultural_ambassador', 'Cultural Ambassador', 'Master Odia culture and traditions', '🏛️', 'cultural', 'legendary', 500, '{"type": "subject_mastery", "subject": "odissi", "value": 95}'),
('speed_demon', 'Speed Demon', 'Complete a game in record time', '⚡', 'academic', 'rare', 120, '{"type": "speed_completion", "value": 30}'),
('helping_hand', 'Helping Hand', 'Help other students learn', '🤝', 'social', 'epic', 250, '{"type": "peer_help", "value": 5}'),
('tech_wizard', 'Technology Wizard', 'Excel in technology games', '⚡', 'mastery', 'epic', 300, '{"type": "subject_mastery", "subject": "technology", "value": 85}'),
('engineering_genius', 'Engineering Genius', 'Master engineering concepts', '🌉', 'mastery', 'legendary', 400, '{"type": "subject_mastery", "subject": "engineering", "value": 90}');

-- Insert sample games (these would typically be loaded from the default-games.ts file)
INSERT IGNORE INTO games (id, title, subject, class_level, game_type, difficulty, time_estimate, xp_reward, curriculum_data, unlock_requirements) VALUES
('math-drag-drop-algebra', 'Algebra Drag & Drop', 'maths', 8, 'drag-drop', 'BEGINNER', 15, 120, '{"topics": ["Linear Equations", "Basic Algebra", "Variables"], "odishaBoard": true}', '{}'),
('science-chemistry-lab', 'Virtual Chemistry Lab', 'science', 10, 'simulation', 'INTERMEDIATE', 20, 140, '{"topics": ["Chemical Reactions", "Periodic Table", "Lab Safety"], "odishaBoard": true}', '{"level": 5, "games_completed": 3}'),
('odia-festival-memory', 'Odisha Festival Memory Game', 'odissi', 8, 'memory', 'BEGINNER', 18, 130, '{"topics": ["Rath Yatra", "Durga Puja", "Cultural Traditions"], "odishaBoard": true}', '{}'),
('tech-circuit-builder', 'Electronic Circuit Builder', 'technology', 8, 'puzzle', 'BEGINNER', 15, 120, '{"topics": ["Basic Electronics", "Circuits", "Components"], "odishaBoard": true}', '{}'),
('eng-bridge-builder', 'Bridge Engineering Challenge', 'engineering', 11, 'simulation', 'INTERMEDIATE', 22, 170, '{"topics": ["Structural Engineering", "Materials", "Design"], "odishaBoard": true}', '{"level": 15, "subject_mastery": {"maths": 60}}'),
('english-grammar-quest', 'Grammar Adventure Quest', 'english', 7, 'strategy', 'BEGINNER', 15, 110, '{"topics": ["Grammar Rules", "Sentence Structure", "Parts of Speech"], "odishaBoard": true}', '{}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_unlock ON games(difficulty, class_level);
CREATE INDEX IF NOT EXISTS idx_progress_performance ON game_progress(user_id, score, completed_at);
CREATE INDEX IF NOT EXISTS idx_mastery_tracking ON subject_mastery(user_id, mastery_percentage);
CREATE INDEX IF NOT EXISTS idx_analytics_reporting ON learning_analytics(user_id, event_type, timestamp);

-- Create views for common queries
CREATE OR REPLACE VIEW student_game_summary AS
SELECT 
    u.id as user_id,
    u.name as student_name,
    u.grade,
    gs.level,
    gs.total_points,
    gs.games_completed,
    gs.average_score,
    gs.learning_streak_days,
    COUNT(DISTINCT gp.game_id) as unique_games_played,
    SUM(gp.xp_earned) as total_xp_earned,
    AVG(gp.score) as overall_average_score,
    MAX(gp.completed_at) as last_game_played
FROM users u
LEFT JOIN game_stats gs ON u.id = gs.user_id
LEFT JOIN game_progress gp ON u.id = gp.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.name, u.grade, gs.level, gs.total_points, gs.games_completed, gs.average_score, gs.learning_streak_days;

CREATE OR REPLACE VIEW subject_performance_summary AS
SELECT 
    sm.user_id,
    sm.subject,
    sm.class_level,
    sm.mastery_level,
    sm.total_xp,
    sm.games_completed,
    sm.average_score,
    sm.mastery_percentage,
    sm.current_streak,
    COUNT(gp.id) as total_attempts,
    MAX(gp.completed_at) as last_played
FROM subject_mastery sm
LEFT JOIN game_progress gp ON sm.user_id = gp.user_id
LEFT JOIN games g ON gp.game_id = g.id AND g.subject = sm.subject
GROUP BY sm.user_id, sm.subject, sm.class_level, sm.mastery_level, sm.total_xp, sm.games_completed, sm.average_score, sm.mastery_percentage, sm.current_streak;

-- Triggers for automatic updates
DELIMITER //

-- Update game_stats when game_progress is inserted
CREATE TRIGGER IF NOT EXISTS update_game_stats_on_progress
AFTER INSERT ON game_progress
FOR EACH ROW
BEGIN
    INSERT INTO game_stats (user_id, games_completed, total_points, average_score, total_time_spent)
    VALUES (NEW.user_id, 1, NEW.xp_earned, NEW.score, NEW.time_spent)
    ON DUPLICATE KEY UPDATE
        games_completed = games_completed + 1,
        total_points = total_points + NEW.xp_earned,
        average_score = (average_score * (games_completed - 1) + NEW.score) / games_completed,
        total_time_spent = total_time_spent + NEW.time_spent,
        updated_at = CURRENT_TIMESTAMP;
END//

-- Update subject_mastery when game_progress is inserted
CREATE TRIGGER IF NOT EXISTS update_subject_mastery_on_progress
AFTER INSERT ON game_progress
FOR EACH ROW
BEGIN
    DECLARE game_subject VARCHAR(50);
    DECLARE game_class_level INT;
    
    SELECT subject, class_level INTO game_subject, game_class_level
    FROM games WHERE id = NEW.game_id;
    
    INSERT INTO subject_mastery (user_id, subject, class_level, games_completed, total_xp, average_score)
    VALUES (NEW.user_id, game_subject, game_class_level, 1, NEW.xp_earned, NEW.score)
    ON DUPLICATE KEY UPDATE
        games_completed = games_completed + 1,
        total_xp = total_xp + NEW.xp_earned,
        average_score = (average_score * (games_completed - 1) + NEW.score) / games_completed,
        mastery_percentage = LEAST(95, (average_score * 0.6 + LEAST(games_completed * 5, 30) + total_xp / 50)),
        last_updated = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- Add some sample curriculum cache data
INSERT IGNORE INTO curriculum_cache (id, subject, class_level, topic, language, content, version, expires_at) VALUES
('maths_8_algebra_en', 'maths', 8, 'Algebra', 'en', '{"concepts": ["Variables", "Linear Equations", "Solving Equations"], "examples": ["2x + 3 = 7", "x - 5 = 10"], "difficulty": "beginner"}', '1.0', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('science_10_chemistry_en', 'science', 10, 'Chemistry', 'en', '{"concepts": ["Chemical Reactions", "Acids and Bases", "Periodic Table"], "experiments": ["pH Testing", "Reaction Observation"], "difficulty": "intermediate"}', '1.0', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('odissi_8_festivals_od', 'odissi', 8, 'Festivals', 'od', '{"festivals": ["ରଥଯାତ୍ରା", "ଦୁର୍ଗାପୂଜା", "କାଳୀପୂଜା"], "significance": ["Cultural Heritage", "Religious Importance"], "difficulty": "beginner"}', '1.0', DATE_ADD(NOW(), INTERVAL 30 DAY));

COMMIT;
