#!/usr/bin/env python3
"""
System Status Checker for Shiksha Game Integration Platform
Verifies all components are working correctly
"""

import requests
import json
import sys
import os
from datetime import datetime

def print_status(message, status="INFO"):
    colors = {
        "SUCCESS": "\033[92m✅",
        "ERROR": "\033[91m❌", 
        "WARNING": "\033[93m⚠️",
        "INFO": "\033[94mℹ️"
    }
    reset = "\033[0m"
    print(f"{colors.get(status, '')} {message}{reset}")

def check_frontend():
    """Check if frontend is running"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print_status("Frontend is running on http://localhost:3000", "SUCCESS")
            return True
        else:
            print_status(f"Frontend returned status code: {response.status_code}", "WARNING")
            return False
    except requests.exceptions.RequestException as e:
        print_status(f"Frontend not accessible: {e}", "ERROR")
        return False

def check_backend():
    """Check if backend API is running"""
    try:
        response = requests.get("http://127.0.0.1:8001/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_status(f"Backend API is running: {data.get('message', 'OK')}", "SUCCESS")
            return True
        else:
            print_status(f"Backend API returned status code: {response.status_code}", "WARNING")
            return False
    except requests.exceptions.RequestException as e:
        print_status(f"Backend API not accessible: {e}", "ERROR")
        return False

def check_database():
    """Check database connectivity"""
    try:
        # Import here to avoid issues if backend isn't set up
        sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
        from config import get_db_connection
        
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM games")
            game_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM achievements") 
            achievement_count = cursor.fetchone()[0]
            
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]
            
            conn.close()
            
            print_status(f"Database connected: {len(tables)} tables, {game_count} games, {achievement_count} achievements", "SUCCESS")
            return True
        else:
            print_status("Database connection failed", "ERROR")
            return False
    except Exception as e:
        print_status(f"Database check failed: {e}", "ERROR")
        return False

def check_game_endpoints():
    """Check game-specific API endpoints"""
    endpoints = [
        ("/api/games", "Games list"),
        ("/api/student/stats", "Student statistics")
    ]
    
    results = []
    for endpoint, description in endpoints:
        try:
            response = requests.get(
                f"http://127.0.0.1:8001{endpoint}",
                headers={"Authorization": "Bearer test-token"},
                timeout=5
            )
            if response.status_code in [200, 401]:  # 401 is expected for auth
                print_status(f"{description} endpoint working", "SUCCESS")
                results.append(True)
            else:
                print_status(f"{description} endpoint returned {response.status_code}", "WARNING")
                results.append(False)
        except Exception as e:
            print_status(f"{description} endpoint failed: {e}", "ERROR")
            results.append(False)
    
    return all(results)

def check_file_structure():
    """Check if key files exist"""
    key_files = [
        "components/games/StudentGameDashboard.tsx",
        "components/games/GameContainer.tsx", 
        "components/games/GameSystemProvider.tsx",
        "components/games/scenes/MathDragDropScene.ts",
        "components/games/scenes/ScienceMemoryScene.ts",
        "lib/storage/indexed-db.ts",
        "backend/game_api_clean.py",
        "backend/config.py"
    ]
    
    missing_files = []
    for file_path in key_files:
        full_path = os.path.join(os.path.dirname(__file__), file_path)
        if os.path.exists(full_path):
            print_status(f"✓ {file_path}", "SUCCESS")
        else:
            print_status(f"✗ {file_path} - MISSING", "ERROR")
            missing_files.append(file_path)
    
    return len(missing_files) == 0

def main():
    print("🎮 Shiksha Game Integration System Status Check")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check all components
    checks = [
        ("File Structure", check_file_structure),
        ("Frontend (Next.js)", check_frontend),
        ("Backend API (Flask)", check_backend), 
        ("Database (MySQL)", check_database),
        ("Game Endpoints", check_game_endpoints)
    ]
    
    results = {}
    for check_name, check_func in checks:
        print(f"\n🔍 Checking {check_name}...")
        try:
            results[check_name] = check_func()
        except Exception as e:
            print_status(f"{check_name} check failed with exception: {e}", "ERROR")
            results[check_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SYSTEM STATUS SUMMARY")
    print("=" * 60)
    
    total_checks = len(results)
    passed_checks = sum(results.values())
    
    for check_name, passed in results.items():
        status = "SUCCESS" if passed else "ERROR"
        print_status(f"{check_name}: {'PASS' if passed else 'FAIL'}", status)
    
    print(f"\n📈 Overall Status: {passed_checks}/{total_checks} checks passed")
    
    if passed_checks == total_checks:
        print_status("🎉 All systems operational! Your game platform is ready!", "SUCCESS")
        print("\n🚀 Quick Start:")
        print("   • Frontend: http://localhost:3000")
        print("   • Student Dashboard: http://localhost:3000/student") 
        print("   • API Health: http://127.0.0.1:8001/api/health")
        print("   • Test Page: file:///" + os.path.join(os.path.dirname(__file__), "test-game-integration.html"))
    elif passed_checks >= total_checks * 0.8:
        print_status("⚠️ Most systems working, minor issues detected", "WARNING")
    else:
        print_status("❌ Critical issues detected, system needs attention", "ERROR")
    
    return passed_checks == total_checks

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
