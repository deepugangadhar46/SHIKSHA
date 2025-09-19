import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling

# Load environment variables
load_dotenv()

# ==================== DATABASE CONFIGURATION ====================

# MySQL Database Configuration using your Aiven credentials
DATABASE_CONFIG = {
    'host': os.getenv('DATABASE_HOST'),
    'port': int(os.getenv('DATABASE_PORT', 11776)),
    'user': os.getenv('DATABASE_USER'),
    'password': os.getenv('DATABASE_PASSWORD'),
    'database': os.getenv('DATABASE_NAME'),
    'ssl_disabled': False,
    'ssl_verify_cert': True,
    'ssl_ca': os.getenv('CA_CERT_PATH', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'TOOLS', 'ca.pem')),
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci',
    'autocommit': True,
    'time_zone': '+00:00'
}

# Connection Pool Configuration
POOL_CONFIG = {
    'pool_name': 'shiksha_pool',
    'pool_size': 10,
    'pool_reset_session': True,
    **DATABASE_CONFIG
}

# Initialize connection pool
try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(**POOL_CONFIG)
    print("✅ MySQL connection pool initialized successfully")
except mysql.connector.Error as err:
    print(f"❌ Error creating connection pool: {err}")
    connection_pool = None

def get_db_connection():
    """Get a database connection from the pool"""
    try:
        if connection_pool:
            connection = connection_pool.get_connection()
            return connection
        else:
            # Fallback to direct connection if pool failed
            return mysql.connector.connect(**DATABASE_CONFIG)
    except mysql.connector.Error as err:
        print(f"❌ Error getting database connection: {err}")
        return None

def execute_query(query, params=None, fetch=False):
    """Execute a database query with proper connection handling"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if fetch:
            if query.strip().upper().startswith('SELECT'):
                return cursor.fetchall()
            else:
                return cursor.fetchone()
        else:
            connection.commit()
            return cursor.rowcount
            
    except mysql.connector.Error as err:
        print(f"❌ Database query error: {err}")
        if connection:
            connection.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables")
    print("Please set your Gemini API key in the .env file")

# Server Configuration
HOST = "127.0.0.1"
PORT = 8000
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

# ==================== GAME CONFIGURATION ====================

# Game Constants
GAME_CONSTANTS = {
    "XP_PER_LEVEL": 100,
    "POINTS_MULTIPLIER": 2,
    "QUIZ_XP_PER_PERCENTAGE": 10,
    "QUIZ_POINTS_PER_PERCENTAGE": 5,
    "PERFECT_SCORE_BONUS": 50,
    "STREAK_BONUS_MULTIPLIER": 1.5,
    "MAX_DAILY_STREAK_BONUS": 200
}

# Level Thresholds and Rewards
LEVEL_REWARDS = {
    5: {"xp_bonus": 100, "badge": "rising_star"},
    10: {"xp_bonus": 250, "badge": "dedicated_learner"},
    15: {"xp_bonus": 500, "badge": "knowledge_seeker"},
    20: {"xp_bonus": 750, "badge": "wisdom_master"},
    25: {"xp_bonus": 1000, "badge": "legendary_scholar"}
}

# Subject Configuration
SUBJECT_CONFIG = {
    "maths": {
        "icon": "🔢",
        "color": "from-blue-400 to-blue-600",
        "display_name": {"en": "Mathematics", "od": "ଗଣିତ", "hi": "गणित"},
        "difficulty_multiplier": 1.2,
        "categories": ["Algebra", "Geometry", "Arithmetic", "Calculus"]
    },
    "science": {
        "icon": "🔬",
        "color": "from-green-400 to-green-600",
        "display_name": {"en": "Science", "od": "ବିଜ୍ଞାନ", "hi": "विज्ञान"},
        "difficulty_multiplier": 1.1,
        "categories": ["Physics", "Chemistry", "Biology", "Astronomy"]
    },
    "technology": {
        "icon": "⚡",
        "color": "from-yellow-400 to-yellow-600",
        "display_name": {"en": "Technology", "od": "ପ୍ରଯୁକ୍ତିବିଦ୍ୟା", "hi": "प्रौद्योगिकी"},
        "difficulty_multiplier": 1.3,
        "categories": ["Electronics", "Programming", "AI", "Robotics"]
    },
    "engineering": {
        "icon": "🌉",
        "color": "from-orange-400 to-orange-600",
        "display_name": {"en": "Engineering", "od": "ଇଞ୍ଜିନିୟରିଂ", "hi": "इंजीनियरिंग"},
        "difficulty_multiplier": 1.4,
        "categories": ["Civil", "Mechanical", "Aerospace", "Software"]
    },
    "english": {
        "icon": "📚",
        "color": "from-indigo-400 to-indigo-600",
        "display_name": {"en": "English", "od": "ଇଂରାଜୀ", "hi": "अंग्रेजी"},
        "difficulty_multiplier": 1.0,
        "categories": ["Grammar", "Vocabulary", "Literature", "Writing"]
    },
    "odissi": {
        "icon": "🏛️",
        "color": "from-pink-400 to-pink-600",
        "display_name": {"en": "Odissi Culture", "od": "ଓଡ଼ିଶୀ ସଂସ୍କୃତି", "hi": "ओडिसी संस्कृति"},
        "difficulty_multiplier": 1.0,
        "categories": ["Dance", "Culture", "History", "Traditions"]
    }
}

# Badge Configuration for Games and Quizzes
BADGE_CONFIG = {
    "first_login": {
        "icon": "🎯",
        "color": "from-blue-400 to-blue-600",
        "rarity": "common",
        "name": {"en": "First Steps", "od": "ପ୍ରଥମ ପଦକ୍ଷେପ", "hi": "पहला कदम"},
        "description": {
            "en": "Welcome to your learning journey!",
            "od": "ଆପଣଙ୍କ ଶିକ୍ଷା ଯାତ୍ରାରେ ସ୍ୱାଗତ!",
            "hi": "आपकी सीखने की यात्रा में आपका स्वागत है!"
        },
        "points_reward": 50
    },
    "quiz_master": {
        "icon": "🧠",
        "color": "from-purple-400 to-purple-600",
        "rarity": "rare",
        "name": {"en": "Quiz Master", "od": "କୁଇଜ୍ ମାଷ୍ଟର", "hi": "क्विज मास्टर"},
        "description": {"en": "Scored 100% on a quiz", "od": "କୁଇଜ୍‌ରେ ୧୦୦% ସ୍କୋର କରିଛନ୍ତି", "hi": "क्विज में 100% स्कोर किया"},
        "points_reward": 200
    },
    "week_warrior": {
        "icon": "⚔️",
        "color": "from-red-400 to-red-600",
        "rarity": "epic",
        "name": {"en": "Week Warrior", "od": "ସପ୍ତାହ ଯୋଦ୍ଧା", "hi": "सप्ताह योद्धा"},
        "description": {
            "en": "Completed lessons for 7 consecutive days",
            "od": "୭ ଦିନ ଲଗାତାର ପାଠ ସମ୍ପୂର୍ଣ୍ଣ କରିଛନ୍ତି",
            "hi": "7 दिन लगातार पाठ पूरे किए"
        },
        "points_reward": 500
    },
    "streak_master": {
        "icon": "🔥",
        "color": "from-orange-400 to-orange-600",
        "rarity": "legendary",
        "name": {"en": "Streak Master", "od": "ଧାରା ମାଷ୍ଟର", "hi": "श्रृंखला मास्टर"},
        "description": {
            "en": "Maintained a 30-day learning streak",
            "od": "୩୦ ଦିନର ଶିକ୍ଷା ଧାରା ବଜାୟ ରଖିଛନ୍ତି",
            "hi": "30 दिन की सीखने की श्रृंखला बनाए रखी"
        },
        "points_reward": 1500
    },
    "subject_expert": {
        "icon": "🎓",
        "color": "from-green-400 to-green-600",
        "rarity": "epic",
        "name": {"en": "Subject Expert", "od": "ବିଷୟ ବିଶେଷଜ୍ଞ", "hi": "विषय विशेषज्ञ"},
        "description": {
            "en": "Completed all lessons in a subject",
            "od": "ଏକ ବିଷୟର ସମସ୍ତ ପାଠ ସମ୍ପୂର୍ଣ୍ଣ କରିଛନ୍ତି",
            "hi": "एक विषय के सभी पाठ पूरे किए"
        },
        "points_reward": 1000
    },
    "cultural_explorer": {
        "icon": "🏛️",
        "color": "from-amber-400 to-orange-600",
        "rarity": "rare",
        "name": {"en": "Cultural Explorer", "od": "ସାଂସ୍କୃତିକ ଅନ୍ୱେଷକ", "hi": "सांस्कृतिक खोजकर्ता"},
        "description": {"en": "Learned about Odisha culture", "od": "ଓଡ଼ିଶା ସଂସ୍କୃତି ବିଷୟରେ ଶିଖିଛନ୍ତି", "hi": "ओडिशा संस्कृति के बारे में सीखा"},
        "points_reward": 300
    },
    "speed_demon": {
        "icon": "⚡",
        "color": "from-yellow-400 to-yellow-600",
        "rarity": "rare",
        "name": {"en": "Speed Demon", "od": "ଦ୍ରୁତ ଗତି ଶିକ୍ଷାର୍ଥୀ", "hi": "तेज़ गति शिक्षार्थी"},
        "description": {"en": "Completed quiz in under 30 seconds", "od": "୩୦ ସେକେଣ୍ଡରେ କୁଇଜ୍ ସମ୍ପୂର୍ଣ୍ଣ କରିଛନ୍ତି", "hi": "30 सेकंड में क्विज पूरा किया"},
        "points_reward": 250
    },
    "perfectionist": {
        "icon": "💎",
        "color": "from-cyan-400 to-blue-600",
        "rarity": "epic",
        "name": {"en": "Perfectionist", "od": "ସିଦ୍ଧତାବାଦୀ", "hi": "पूर्णतावादी"},
        "description": {"en": "Scored 100% on 5 consecutive quizzes", "od": "୫ଟି କ୍ରମାଗତ କୁଇଜ୍‌ରେ ୧୦୦% ସ୍କୋର", "hi": "5 लगातार क्विज़ में 100% स्कोर"},
        "points_reward": 750
    }
}

# Quiz Configuration
QUIZ_CONFIG = {
    "default_time_limit": 300,  # 5 minutes in seconds
    "questions_per_quiz": 10,
    "passing_score": 70,
    "excellent_score": 90,
    "perfect_score": 100,
    "time_bonus_threshold": 60,  # seconds
    "difficulty_levels": {
        "beginner": {"multiplier": 1.0, "time_limit": 400},
        "intermediate": {"multiplier": 1.5, "time_limit": 300},
        "advanced": {"multiplier": 2.0, "time_limit": 200}
    },
    "question_types": {
        "multiple_choice": {"points": 10, "time_limit": 30},
        "true_false": {"points": 5, "time_limit": 15},
        "fill_blank": {"points": 15, "time_limit": 45},
        "matching": {"points": 20, "time_limit": 60}
    }
}

# Game Mechanics Configuration
GAME_MECHANICS = {
    "combo_system": {
        "enabled": True,
        "max_combo": 10,
        "combo_multiplier": 0.1,  # 10% bonus per combo level
        "combo_timeout": 5  # seconds
    },
    "power_ups": {
        "time_freeze": {"duration": 10, "cost": 100},
        "double_points": {"duration": 30, "cost": 150},
        "hint_reveal": {"uses": 3, "cost": 50},
        "skip_question": {"uses": 2, "cost": 75}
    },
    "achievements": {
        "first_quiz": {"xp": 50, "badge": "first_login"},
        "perfect_score": {"xp": 100, "badge": "quiz_master"},
        "speed_run": {"xp": 75, "badge": "speed_demon"},
        "streak_3": {"xp": 150, "badge": None},
        "streak_7": {"xp": 300, "badge": "week_warrior"},
        "streak_30": {"xp": 1000, "badge": "streak_master"}
    }
}

# Cultural Context for Odisha-specific Games
CULTURAL_CONTEXT = {
    "festivals": {
        "rath_yatra": {
            "name": {"en": "Rath Yatra", "od": "ରଥଯାତ୍ରା", "hi": "रथ यात्रा"},
            "description": {"en": "Chariot Festival of Lord Jagannath", "od": "ଜଗନ୍ନାଥଙ୍କ ରଥଯାତ୍ରା", "hi": "भगवान जगन्नाथ का रथ उत्सव"},
            "quiz_topics": ["history", "traditions", "significance", "dates"]
        },
        "durga_puja": {
            "name": {"en": "Durga Puja", "od": "ଦୁର୍ଗାପୂଜା", "hi": "दुर्गा पूजा"},
            "description": {"en": "Festival of Goddess Durga", "od": "ଦେବୀ ଦୁର୍ଗାର ପର୍ବ", "hi": "देवी दुर्गा का त्योहार"},
            "quiz_topics": ["mythology", "rituals", "cultural_significance"]
        }
    },
    "monuments": {
        "konark_temple": {
            "name": {"en": "Konark Sun Temple", "od": "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର", "hi": "कोणार्क सूर्य मंदिर"},
            "quiz_topics": ["architecture", "history", "science", "mathematics"],
            "game_contexts": ["geometry", "astronomy", "engineering"]
        },
        "jagannath_temple": {
            "name": {"en": "Jagannath Temple", "od": "ଜଗନ୍ନାଥ ମନ୍ଦିର", "hi": "जगन्नाथ मंदिर"},
            "quiz_topics": ["history", "culture", "traditions", "architecture"],
            "game_contexts": ["cultural_studies", "history", "art"]
        }
    },
    "traditional_games": {
        "puchi": {"difficulty": "beginner", "subjects": ["math", "strategy"]},
        "kabaddi": {"difficulty": "intermediate", "subjects": ["physics", "strategy"]},
        "kho_kho": {"difficulty": "beginner", "subjects": ["geometry", "physics"]}
    }
}

# Leaderboard Configuration
LEADERBOARD_CONFIG = {
    "categories": ["overall", "weekly", "subject_wise", "quiz_master"],
    "refresh_intervals": {
        "overall": 3600,  # 1 hour
        "weekly": 1800,   # 30 minutes
        "subject_wise": 1800,
        "quiz_master": 900  # 15 minutes
    },
    "max_entries": 100,
    "anonymize_after": 10  # Show only top 10, rest anonymous
}
