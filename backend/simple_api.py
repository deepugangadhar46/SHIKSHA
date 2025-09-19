#!/usr/bin/env python3
"""
Simple Game API for testing - minimal dependencies
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Sample game data
SAMPLE_GAMES = [
    {
        "id": "math-algebra-quest",
        "title": "Algebra Quest",
        "subject": "maths",
        "difficulty": "BEGINNER",
        "time_estimate": 15,
        "xp_reward": 120,
        "is_unlocked": True,
        "is_completed": False,
        "best_score": 0,
        "attempts": 0
    },
    {
        "id": "science-chemistry-lab",
        "title": "Chemistry Lab",
        "subject": "science", 
        "difficulty": "INTERMEDIATE",
        "time_estimate": 20,
        "xp_reward": 150,
        "is_unlocked": True,
        "is_completed": False,
        "best_score": 0,
        "attempts": 0
    },
    {
        "id": "odia-culture-festival",
        "title": "Odisha Festivals",
        "subject": "odissi",
        "difficulty": "BEGINNER", 
        "time_estimate": 18,
        "xp_reward": 130,
        "is_unlocked": True,
        "is_completed": False,
        "best_score": 0,
        "attempts": 0
    }
]

SAMPLE_ACHIEVEMENTS = [
    {
        "id": "first_game",
        "name": "First Steps",
        "description": "Complete your first game",
        "icon": "🎯",
        "category": "academic",
        "rarity": "common",
        "xp_reward": 50
    },
    {
        "id": "perfect_score", 
        "name": "Perfectionist",
        "description": "Score 100% on any game",
        "icon": "💯",
        "category": "academic", 
        "rarity": "rare",
        "xp_reward": 100
    }
]

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Simple Game API is running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/games', methods=['GET'])
def get_games():
    """Get available games"""
    # Simple auth check - accept any Bearer token for testing
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authentication required'}), 401
    
    subject = request.args.get('subject')
    
    games = SAMPLE_GAMES
    if subject:
        games = [g for g in games if g['subject'] == subject]
    
    return jsonify({
        'success': True,
        'games': games,
        'total': len(games)
    })

@app.route('/api/games/<game_id>', methods=['GET'])
def get_game_details(game_id):
    """Get game details"""
    game = next((g for g in SAMPLE_GAMES if g['id'] == game_id), None)
    
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    return jsonify({
        'success': True,
        'game': game
    })

@app.route('/api/student/stats', methods=['GET'])
def get_student_stats():
    """Get student statistics"""
    # Simple auth check - accept any Bearer token for testing
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authentication required'}), 401
    
    return jsonify({
        'success': True,
        'stats': {
            'level': 5,
            'total_points': 450,
            'current_streak': 3,
            'games_completed': 8,
            'level_info': {
                'level': 5,
                'current_level_xp': 50,
                'xp_to_next_level': 50,
                'total_xp': 450
            }
        }
    })

@app.route('/api/achievements', methods=['GET'])
def get_achievements():
    """Get available achievements"""
    return jsonify({
        'success': True,
        'achievements': SAMPLE_ACHIEVEMENTS
    })

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard data"""
    return jsonify({
        'success': True,
        'leaderboard': [
            {
                'rank': 1,
                'name': 'Priya Sharma',
                'level': 15,
                'xp': 1250,
                'streak': 21
            },
            {
                'rank': 2,
                'name': 'Arjun Patel', 
                'level': 14,
                'xp': 1180,
                'streak': 18
            },
            {
                'rank': 3,
                'name': 'You',
                'level': 5,
                'xp': 450,
                'streak': 3
            }
        ]
    })

if __name__ == '__main__':
    print("🎮 Starting Simple Game API...")
    print("📍 API available at: http://127.0.0.1:8001")
    print("🔗 Health check: http://127.0.0.1:8001/api/health")
    print("🎯 Games endpoint: http://127.0.0.1:8001/api/games")
    
    try:
        app.run(debug=False, host='127.0.0.1', port=8001, threaded=True)
    except Exception as e:
        print(f"❌ Error starting API: {e}")
        print("Trying port 8002...")
        try:
            app.run(debug=False, host='127.0.0.1', port=8002, threaded=True)
        except Exception as e2:
            print(f"❌ Error starting on port 8002: {e2}")
            print("Please check if ports are available")
