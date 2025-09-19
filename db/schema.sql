-- SHIKSHA Database Schema for Aiven MySQL
-- Run this script in your Aiven MySQL console to create the required tables

-- Users table
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
);

-- Sessions table for authentication
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
);

-- Game statistics table
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
);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    attempts INT DEFAULT 1,
    time_spent INT DEFAULT 0, -- in seconds
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_user_id (user_id),
    INDEX idx_subject (subject),
    INDEX idx_completed (completed)
);

-- Content table for lessons, quizzes, activities
CREATE TABLE IF NOT EXISTS content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject ENUM('science', 'technology', 'engineering', 'english', 'maths', 'odissi') NOT NULL,
    topic VARCHAR(255) NOT NULL,
    grade INT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    type ENUM('lesson', 'quiz', 'activity', 'story') NOT NULL,
    title JSON NOT NULL, -- {en: "", od: "", hi: ""}
    content JSON NOT NULL, -- {en: "", od: "", hi: ""}
    questions JSON, -- Array of question objects
    cultural_context JSON, -- {en: "", od: "", hi: ""}
    media_urls JSON, -- Array of media URLs
    tags JSON, -- Array of tags
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_subject_grade (subject, grade),
    INDEX idx_type (type),
    INDEX idx_difficulty (difficulty)
);

-- Quiz attempts table for analytics
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    time_taken INT NOT NULL, -- in seconds
    answers JSON, -- Array of answer objects with concept mapping
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES content(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_completed_at (completed_at)
);

-- Student concept mastery for analytics
CREATE TABLE IF NOT EXISTS student_concept_mastery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    concept_name VARCHAR(255) NOT NULL,
    mastery_level DECIMAL(5,2) DEFAULT 0.00, -- 0-100 percentage
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_concept (user_id, subject, concept_name),
    INDEX idx_user_subject (user_id, subject),
    INDEX idx_mastery_level (mastery_level)
);

-- Student activity log for analytics
CREATE TABLE IF NOT EXISTS student_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type ENUM('login', 'logout', 'lesson_start', 'lesson_complete', 'quiz_start', 'quiz_complete', 'badge_earned') NOT NULL,
    details JSON, -- Additional context about the action
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_timestamp (timestamp)
);

-- Teacher insights for AI-generated recommendations
CREATE TABLE IF NOT EXISTS teacher_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    insight_text TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    category ENUM('performance', 'engagement', 'concept_difficulty', 'recommendation') DEFAULT 'recommendation',
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_priority (priority),
    INDEX idx_is_resolved (is_resolved)
);

-- Classes table for teacher-student relationships
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grade INT NOT NULL,
    teacher_id INT NOT NULL,
    school VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_grade (grade)
);

-- Class enrollments (many-to-many relationship)
CREATE TABLE IF NOT EXISTS class_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_student (class_id, student_id),
    INDEX idx_class_id (class_id),
    INDEX idx_student_id (student_id)
);

-- Insert default demo data
INSERT IGNORE INTO users (email, password, name, role, avatar, school, preferences, cultural_background) VALUES
('teacher@shiksha.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Teacher', 'teacher', '👩‍🏫', 'SHIKSHA Demo School', 
 '{"language": "en", "theme": "light", "notifications": true, "soundEnabled": true, "reducedMotion": false}',
 '{"region": "Odisha", "language": "Odia", "festivals": ["Rath Yatra", "Durga Puja", "Diwali"]}'),
('student@shiksha.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Student', 'student', '👨‍🎓', 'SHIKSHA Demo School',
 '{"language": "od", "theme": "light", "notifications": true, "soundEnabled": true, "reducedMotion": false}',
 '{"region": "Odisha", "language": "Odia", "festivals": ["Rath Yatra", "Durga Puja", "Diwali"]}');

-- Insert demo class
INSERT IGNORE INTO classes (name, grade, teacher_id, school) 
SELECT 'Grade 8A', 8, id, 'SHIKSHA Demo School' FROM users WHERE email = 'teacher@shiksha.edu' LIMIT 1;

-- Enroll demo student in demo class
INSERT IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, u.id FROM classes c, users u 
WHERE c.name = 'Grade 8A' AND u.email = 'student@shiksha.edu' LIMIT 1;

-- Create initial game stats for demo users
INSERT IGNORE INTO game_stats (user_id, level, total_points, badges, achievements, subject_progress)
SELECT id, 1, 0, '[]', '[]', 
'{"science": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "technology": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "engineering": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "english": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "maths": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}, "odissi": {"level": 1, "xp": 0, "lessonsCompleted": 0, "averageScore": 0}}'
FROM users WHERE email IN ('teacher@shiksha.edu', 'student@shiksha.edu');
