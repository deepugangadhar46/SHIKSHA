# Game API Endpoints for Odisha Rural Education Platform
# Handles game progress, achievements, and curriculum integration
# Integrates with existing MySQL database and authentication system

from flask import Flask, request, jsonify, g
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
import json
import hashlib
import uuid
from typing import Dict, List, Optional, Any
from config import get_db_connection, execute_query, GAME_CONSTANTS, SUBJECT_CONFIG, BADGE_CONFIG
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Authentication decorator (using existing auth system)
def require_auth(f):
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        if not user:
            return jsonify({'error': 'Invalid token'}), 401
        
        g.current_user = user
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function

def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token and return user data"""
    try:
        # This would integrate with your existing JWT verification
        # For now, return a mock user for development
        query = "SELECT * FROM users WHERE id = %s"
        result = execute_query(query, (1,), fetch=True)
        return result[0] if result else None
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None

# Game Management Endpoints

@app.route('/api/games', methods=['GET'])
@require_auth
def get_games():
    """Get available games for a student"""
    try:
        subject = request.args.get('subject')
        class_level = request.args.get('class_level', type=int)
        difficulty = request.args.get('difficulty')
        
        query = """
        SELECT g.*, 
               CASE WHEN gp.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_completed,
               COALESCE(MAX(gp.score), 0) as best_score,
               COUNT(gp.id) as attempts
        FROM games g
        LEFT JOIN game_progress gp ON g.id = gp.game_id AND gp.user_id = %s
        WHERE g.is_active = TRUE
        """
        params = [g.current_user['id']]
        
        if subject:
            query += " AND g.subject = %s"
            params.append(subject)
        
        if class_level:
            query += " AND g.class_level = %s"
            params.append(class_level)
        
        if difficulty:
            query += " AND g.difficulty = %s"
            params.append(difficulty)
        
        query += " GROUP BY g.id ORDER BY g.class_level, g.difficulty, g.title"
        
        games = execute_query(query, params, fetch=True)
        
        # Check unlock status for each game
        for game in games:
            game['is_unlocked'] = check_game_unlock_status(
                g.current_user['id'], 
                game['id']
            )
        
        return jsonify({
            'success': True,
            'games': games
        })
        
    except Exception as e:
        logger.error(f"Error fetching games: {e}")
        return jsonify({'error': 'Failed to fetch games'}), 500

@app.route('/api/games/<game_id>', methods=['GET'])
@require_auth
def get_game_details(game_id: str):
    """Get detailed information about a specific game"""
    try:
        query = """
        SELECT g.*, 
               COUNT(gp.id) as total_attempts,
               AVG(gp.score) as average_score,
               MAX(gp.score) as best_score,
               SUM(gp.time_spent) as total_time_spent
        FROM games g
        LEFT JOIN game_progress gp ON g.id = gp.game_id AND gp.user_id = %s
        WHERE g.id = %s AND g.is_active = TRUE
        GROUP BY g.id
        """
        
        result = execute_query(query, (g.current_user['id'], game_id), fetch=True)
        
        if not result:
            return jsonify({'error': 'Game not found'}), 404
        
        game = result[0]
        
        # Get recent progress
        progress_query = """
        SELECT score, time_spent, completed_at, xp_earned
        FROM game_progress
        WHERE user_id = %s AND game_id = %s
        ORDER BY completed_at DESC
        LIMIT 10
        """
        
        progress = execute_query(progress_query, (g.current_user['id'], game_id), fetch=True)
        game['recent_progress'] = progress or []
        
        # Check unlock status
        game['is_unlocked'] = check_game_unlock_status(g.current_user['id'], game_id)
        
        return jsonify({
            'success': True,
            'game': game
        })
        
    except Exception as e:
        logger.error(f"Error fetching game details: {e}")
        return jsonify({'error': 'Failed to fetch game details'}), 500

# Game Progress Endpoints

@app.route('/api/games/<game_id>/start', methods=['POST'])
@require_auth
def start_game_session(game_id: str):
    """Start a new game session"""
    try:
        # Check if game exists and is unlocked
        game = execute_query(
            "SELECT * FROM games WHERE id = %s AND is_active = TRUE",
            (game_id,), fetch=True
        )
        
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        game = game[0]
        
        # Check unlock status
        is_unlocked = check_game_unlock_status(g.current_user['id'], game_id)
        if not is_unlocked:
            return jsonify({'error': 'Game is locked'}), 403
        
        # Create new session
        session_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO game_sessions (id, user_id, game_id, started_at, last_activity, is_active)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        execute_query(query, (
            session_id,
            g.current_user['id'],
            game_id,
            datetime.now(),
            datetime.now(),
            True
        ))
        
        # Log analytics event
        log_analytics_event(g.current_user['id'], game_id, session_id, 'game_start')
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'game': game
        })
        
    except Exception as e:
        logger.error(f"Error starting game session: {e}")
        return jsonify({'error': 'Failed to start game session'}), 500

@app.route('/api/games/<game_id>/progress', methods=['POST'])
@require_auth
def save_game_progress(game_id: str):
    """Save game progress and completion"""
    try:
        data = request.get_json()
        
        required_fields = ['session_id', 'score', 'time_spent', 'completed']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        session_id = data['session_id']
        score = int(data['score'])
        time_spent = int(data['time_spent'])
        completed = bool(data['completed'])
        hints_used = int(data.get('hints_used', 0))
        mistakes = int(data.get('mistakes', 0))
        game_state = data.get('game_state', {})
        
        # Verify session belongs to current user
        session = execute_query(
            "SELECT * FROM game_sessions WHERE id = %s AND user_id = %s",
            (session_id, g.current_user['id']), fetch=True
        )
        
        if not session:
            return jsonify({'error': 'Invalid session'}), 403
        
        # Get game details for XP calculation
        game = execute_query(
            "SELECT * FROM games WHERE id = %s",
            (game_id,), fetch=True
        )[0]
        
        if completed:
            # Calculate XP reward
            xp_earned = calculate_xp_reward(
                game['xp_reward'],
                score,
                time_spent,
                game['time_estimate'] * 60,  # Convert to seconds
                hints_used,
                game['difficulty']
            )
            
            # Save completed progress
            progress_id = str(uuid.uuid4())
            query = """
            INSERT INTO game_progress 
            (id, user_id, game_id, session_id, score, time_spent, hints_used, 
             mistakes, xp_earned, completed_at, game_state)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            execute_query(query, (
                progress_id,
                g.current_user['id'],
                game_id,
                session_id,
                score,
                time_spent,
                hints_used,
                mistakes,
                xp_earned,
                datetime.now(),
                json.dumps(game_state)
            ))
            
            # End game session
            execute_query(
                "UPDATE game_sessions SET is_active = FALSE, ended_at = %s WHERE id = %s",
                (datetime.now(), session_id)
            )
            
            # Update student stats
            update_student_stats(g.current_user['id'], xp_earned, score, time_spent)
            
            # Check for new achievements
            achievements = check_achievements(g.current_user['id'])
            
            # Log completion event
            log_analytics_event(g.current_user['id'], game_id, session_id, 'game_complete', {
                'score': score,
                'xp_earned': xp_earned,
                'time_spent': time_spent
            })
            
            return jsonify({
                'success': True,
                'xp_earned': xp_earned,
                'new_achievements': achievements,
                'progress_id': progress_id
            })
        
        else:
            # Save in-progress state
            execute_query(
                """UPDATE game_sessions 
                   SET current_score = %s, game_state = %s, last_activity = %s 
                   WHERE id = %s""",
                (score, json.dumps(game_state), datetime.now(), session_id)
            )
            
            return jsonify({'success': True, 'message': 'Progress saved'})
        
    except Exception as e:
        logger.error(f"Error saving game progress: {e}")
        return jsonify({'error': 'Failed to save progress'}), 500

# Student Statistics Endpoints

@app.route('/api/student/stats', methods=['GET'])
@require_auth
def get_student_stats():
    """Get comprehensive student statistics"""
    try:
        user_id = g.current_user['id']
        
        # Get basic stats
        stats_query = """
        SELECT gs.*, u.grade, u.name
        FROM game_stats gs
        JOIN users u ON gs.user_id = u.id
        WHERE gs.user_id = %s
        """
        
        stats = execute_query(stats_query, (user_id,), fetch=True)
        if not stats:
            # Create initial stats record
            execute_query(
                "INSERT INTO game_stats (user_id) VALUES (%s)",
                (user_id,)
            )
            stats = execute_query(stats_query, (user_id,), fetch=True)
        
        student_stats = stats[0]
        
        # Get subject mastery
        mastery_query = """
        SELECT subject, mastery_level, total_xp, games_completed, 
               average_score, mastery_percentage, current_streak
        FROM subject_mastery
        WHERE user_id = %s
        """
        
        subject_mastery = execute_query(mastery_query, (user_id,), fetch=True)
        
        # Get recent achievements
        achievements_query = """
        SELECT sa.*, a.name, a.description, a.icon, a.xp_reward
        FROM student_achievements sa
        JOIN achievements a ON sa.achievement_id = a.id
        WHERE sa.user_id = %s
        ORDER BY sa.unlocked_at DESC
        LIMIT 10
        """
        
        recent_achievements = execute_query(achievements_query, (user_id,), fetch=True)
        
        # Calculate level info
        level_info = calculate_level_info(student_stats['total_points'])
        
        return jsonify({
            'success': True,
            'stats': {
                **student_stats,
                'level_info': level_info,
                'subject_mastery': subject_mastery or [],
                'recent_achievements': recent_achievements or []
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching student stats: {e}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500

@app.route('/api/student/progress/<subject>', methods=['GET'])
@require_auth
def get_subject_progress(subject: str):
    """Get detailed progress for a specific subject"""
    try:
        user_id = g.current_user['id']
        class_level = g.current_user.get('grade', 8)
        
        # Get subject mastery
        mastery_query = """
        SELECT * FROM subject_mastery
        WHERE user_id = %s AND subject = %s AND class_level = %s
        """
        
        mastery = execute_query(mastery_query, (user_id, subject, class_level), fetch=True)
        
        # Get game progress for this subject
        progress_query = """
        SELECT gp.*, g.title, g.difficulty, g.game_type
        FROM game_progress gp
        JOIN games g ON gp.game_id = g.id
        WHERE gp.user_id = %s AND g.subject = %s
        ORDER BY gp.completed_at DESC
        """
        
        progress = execute_query(progress_query, (user_id, subject), fetch=True)
        
        # Get available games for this subject
        games_query = """
        SELECT g.*, 
               CASE WHEN gp.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_completed,
               COALESCE(MAX(gp.score), 0) as best_score
        FROM games g
        LEFT JOIN game_progress gp ON g.id = gp.game_id AND gp.user_id = %s
        WHERE g.subject = %s AND g.class_level = %s AND g.is_active = TRUE
        GROUP BY g.id
        """
        
        games = execute_query(games_query, (user_id, subject, class_level), fetch=True)
        
        return jsonify({
            'success': True,
            'subject': subject,
            'mastery': mastery[0] if mastery else None,
            'recent_progress': progress or [],
            'available_games': games or []
        })
        
    except Exception as e:
        logger.error(f"Error fetching subject progress: {e}")
        return jsonify({'error': 'Failed to fetch subject progress'}), 500

# Achievement System Endpoints

@app.route('/api/achievements', methods=['GET'])
@require_auth
def get_achievements():
    """Get all achievements and student's progress"""
    try:
        user_id = g.current_user['id']
        
        # Get all achievements with student's unlock status
        query = """
        SELECT a.*, 
               CASE WHEN sa.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_unlocked,
               sa.unlocked_at
        FROM achievements a
        LEFT JOIN student_achievements sa ON a.id = sa.achievement_id AND sa.user_id = %s
        WHERE a.is_active = TRUE
        ORDER BY a.category, a.rarity, a.name
        """
        
        achievements = execute_query(query, (user_id,), fetch=True)
        
        # Group by category
        grouped_achievements = {}
        for achievement in achievements:
            category = achievement['category']
            if category not in grouped_achievements:
                grouped_achievements[category] = []
            grouped_achievements[category].append(achievement)
        
        return jsonify({
            'success': True,
            'achievements': grouped_achievements
        })
        
    except Exception as e:
        logger.error(f"Error fetching achievements: {e}")
        return jsonify({'error': 'Failed to fetch achievements'}), 500

# Leaderboard Endpoints

@app.route('/api/leaderboard', methods=['GET'])
@require_auth
def get_leaderboard():
    """Get leaderboard data"""
    try:
        leaderboard_type = request.args.get('type', 'overall')
        subject = request.args.get('subject')
        class_level = request.args.get('class_level', type=int)
        limit = request.args.get('limit', 50, type=int)
        
        query = """
        SELECT u.name, u.avatar, gs.level, gs.total_points, gs.games_completed,
               gs.average_score, gs.current_streak,
               ROW_NUMBER() OVER (ORDER BY gs.total_points DESC) as rank_position
        FROM game_stats gs
        JOIN users u ON gs.user_id = u.id
        WHERE u.role = 'student'
        """
        params = []
        
        if class_level:
            query += " AND u.grade = %s"
            params.append(class_level)
        
        if subject and leaderboard_type == 'subject':
            # For subject leaderboards, we'd need to calculate subject-specific scores
            # This is a simplified version
            query += " AND gs.favorite_subject = %s"
            params.append(subject)
        
        query += f" ORDER BY gs.total_points DESC LIMIT {limit}"
        
        leaderboard = execute_query(query, params, fetch=True)
        
        # Get current user's rank
        user_rank_query = """
        SELECT COUNT(*) + 1 as user_rank
        FROM game_stats gs1
        JOIN game_stats gs2 ON gs2.user_id = %s
        WHERE gs1.total_points > gs2.total_points
        """
        
        user_rank = execute_query(user_rank_query, (g.current_user['id'],), fetch=True)
        current_user_rank = user_rank[0]['user_rank'] if user_rank else None
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard or [],
            'current_user_rank': current_user_rank,
            'type': leaderboard_type
        })
        
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500

# Helper Functions

def check_game_unlock_status(user_id: int, game_id: str) -> bool:
    """Check if a game is unlocked for a student"""
    try:
        # Get game requirements
        game = execute_query(
            "SELECT unlock_requirements FROM games WHERE id = %s",
            (game_id,), fetch=True
        )[0]
        
        requirements = json.loads(game['unlock_requirements'] or '{}')
        
        if not requirements:
            return True  # No requirements = always unlocked
        
        # Get student stats
        stats = execute_query(
            "SELECT * FROM game_stats WHERE user_id = %s",
            (user_id,), fetch=True
        )
        
        if not stats:
            return False
        
        student_stats = stats[0]
        
        # Check level requirement
        if 'level' in requirements:
            if student_stats['level'] < requirements['level']:
                return False
        
        # Check games completed requirement
        if 'games_completed' in requirements:
            if student_stats['games_completed'] < requirements['games_completed']:
                return False
        
        # Check subject mastery requirement
        if 'subject_mastery' in requirements:
            for subject, required_mastery in requirements['subject_mastery'].items():
                mastery = execute_query(
                    "SELECT mastery_percentage FROM subject_mastery WHERE user_id = %s AND subject = %s",
                    (user_id, subject), fetch=True
                )
                
                if not mastery or mastery[0]['mastery_percentage'] < required_mastery:
                    return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error checking unlock status: {e}")
        return False

def calculate_xp_reward(base_xp: int, score: int, time_spent: int, time_limit: int, 
                       hints_used: int, difficulty: str) -> int:
    """Calculate XP reward based on performance"""
    try:
        total_xp = base_xp
        
        # Score bonus (0-50% bonus)
        score_bonus = int(base_xp * (score / 100) * 0.5)
        total_xp += score_bonus
        
        # Time bonus (up to 25% bonus for completing quickly)
        if time_limit > 0:
            time_ratio = max(0, (time_limit - time_spent) / time_limit)
            time_bonus = int(base_xp * time_ratio * 0.25)
            total_xp += time_bonus
        
        # Hint penalty (5% reduction per hint)
        hint_penalty = int(base_xp * hints_used * 0.05)
        total_xp -= hint_penalty
        
        # Difficulty multiplier
        difficulty_multipliers = {
            'BEGINNER': 1.0,
            'INTERMEDIATE': 1.3,
            'ADVANCED': 1.6
        }
        multiplier = difficulty_multipliers.get(difficulty, 1.0)
        total_xp = int(total_xp * multiplier)
        
        return max(total_xp, 1)  # Minimum 1 XP
        
    except Exception as e:
        logger.error(f"Error calculating XP reward: {e}")
        return base_xp

def update_student_stats(user_id: int, xp_earned: int, score: int, time_spent: int):
    """Update student statistics after game completion"""
    try:
        # This is handled by database triggers, but we can add additional logic here
        # Update favorite subject based on recent activity
        recent_games_query = """
        SELECT g.subject, COUNT(*) as game_count
        FROM game_progress gp
        JOIN games g ON gp.game_id = g.id
        WHERE gp.user_id = %s AND gp.completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY g.subject
        ORDER BY game_count DESC
        LIMIT 1
        """
        
        result = execute_query(recent_games_query, (user_id,), fetch=True)
        if result:
            favorite_subject = result[0]['subject']
            execute_query(
                "UPDATE game_stats SET favorite_subject = %s WHERE user_id = %s",
                (favorite_subject, user_id)
            )
        
    except Exception as e:
        logger.error(f"Error updating student stats: {e}")

def check_achievements(user_id: int) -> List[Dict]:
    """Check for newly unlocked achievements"""
    try:
        # Get student's current stats
        stats = execute_query(
            "SELECT * FROM game_stats WHERE user_id = %s",
            (user_id,), fetch=True
        )[0]
        
        # Get all achievements not yet unlocked
        achievements_query = """
        SELECT a.* FROM achievements a
        LEFT JOIN student_achievements sa ON a.id = sa.achievement_id AND sa.user_id = %s
        WHERE sa.user_id IS NULL AND a.is_active = TRUE
        """
        
        achievements = execute_query(achievements_query, (user_id,), fetch=True)
        
        new_achievements = []
        
        for achievement in achievements:
            requirements = json.loads(achievement['requirements'])
            
            # Check if requirements are met (simplified logic)
            if check_achievement_requirements(stats, requirements):
                # Award achievement
                execute_query(
                    "INSERT INTO student_achievements (user_id, achievement_id, unlocked_at) VALUES (%s, %s, %s)",
                    (user_id, achievement['id'], datetime.now())
                )
                
                # Award XP
                execute_query(
                    "UPDATE game_stats SET total_points = total_points + %s WHERE user_id = %s",
                    (achievement['xp_reward'], user_id)
                )
                
                new_achievements.append(achievement)
        
        return new_achievements
        
    except Exception as e:
        logger.error(f"Error checking achievements: {e}")
        return []

def check_achievement_requirements(stats: Dict, requirements: Dict) -> bool:
    """Check if achievement requirements are met"""
    try:
        req_type = requirements.get('type')
        req_value = requirements.get('value')
        
        if req_type == 'games_completed':
            return stats['games_completed'] >= req_value
        elif req_type == 'level':
            return stats['level'] >= req_value
        elif req_type == 'streak':
            return stats['current_streak'] >= req_value
        elif req_type == 'perfect_score':
            # This would need additional logic to track perfect scores
            return True  # Placeholder
        
        return False
        
    except Exception as e:
        logger.error(f"Error checking achievement requirements: {e}")
        return False

def calculate_level_info(total_points: int) -> Dict:
    """Calculate level information from total points"""
    level = total_points // GAME_CONSTANTS['XP_PER_LEVEL'] + 1
    current_level_xp = total_points % GAME_CONSTANTS['XP_PER_LEVEL']
    xp_to_next_level = GAME_CONSTANTS['XP_PER_LEVEL'] - current_level_xp
    
    return {
        'level': level,
        'current_level_xp': current_level_xp,
        'xp_to_next_level': xp_to_next_level,
        'total_xp': total_points
    }

def log_analytics_event(user_id: int, game_id: str, session_id: str, 
                       event_type: str, event_data: Dict = None):
    """Log analytics event for reporting"""
    try:
        execute_query(
            """INSERT INTO learning_analytics 
               (user_id, game_id, session_id, event_type, event_data) 
               VALUES (%s, %s, %s, %s, %s)""",
            (user_id, game_id, session_id, event_type, json.dumps(event_data or {}))
        )
    except Exception as e:
        logger.error(f"Error logging analytics event: {e}")

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8001)
