# Game API Endpoints for Odisha Rural Education Platform
# Clean version without async/await issues

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
            'games': games or []
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
        
        student_stats = stats[0] if stats else {}
        
        # Calculate level info
        level_info = calculate_level_info(student_stats.get('total_points', 0))
        
        return jsonify({
            'success': True,
            'stats': {
                **student_stats,
                'level_info': level_info
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching student stats: {e}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500

# Helper Functions

def check_game_unlock_status(user_id: int, game_id: str) -> bool:
    """Check if a game is unlocked for a student"""
    try:
        # Get game requirements
        game = execute_query(
            "SELECT unlock_requirements FROM games WHERE id = %s",
            (game_id,), fetch=True
        )
        
        if not game:
            return False
            
        requirements = json.loads(game[0].get('unlock_requirements', '{}') or '{}')
        
        if not requirements:
            return True  # No requirements = always unlocked
        
        # Get student stats
        stats = execute_query(
            "SELECT * FROM game_stats WHERE user_id = %s",
            (user_id,), fetch=True
        )
        
        if not stats:
            return len(requirements) == 0  # If no stats, only unlock games with no requirements
        
        student_stats = stats[0]
        
        # Check level requirement
        if 'level' in requirements:
            if student_stats.get('level', 1) < requirements['level']:
                return False
        
        # Check games completed requirement
        if 'games_completed' in requirements:
            if student_stats.get('games_completed', 0) < requirements['games_completed']:
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error checking unlock status: {e}")
        return True  # Default to unlocked on error

def calculate_level_info(total_points: int) -> Dict:
    """Calculate level information from total points"""
    xp_per_level = GAME_CONSTANTS.get('XP_PER_LEVEL', 100)
    level = total_points // xp_per_level + 1
    current_level_xp = total_points % xp_per_level
    xp_to_next_level = xp_per_level - current_level_xp
    
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

# Test endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Game API is running',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🎮 Starting Odisha Education Game API...")
    print("📍 API will be available at: http://127.0.0.1:8001")
    print("🔗 Health check: http://127.0.0.1:8001/api/health")
    app.run(debug=True, host='127.0.0.1', port=8001)
