/**
 * Game API Service
 * Handles all API communication for the game system
 */

import { API_CONFIG, buildApiUrl, getCurrentConfig } from '@/lib/config/api-config';

// Types
export interface GameData {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  time_estimate: number;
  xp_reward: number;
  is_unlocked: boolean;
  is_completed: boolean;
  best_score: number;
  attempts: number;
}

export interface StudentStats {
  level: number;
  total_points: number;
  current_streak: number;
  games_completed: number;
  level_info: {
    level: number;
    current_level_xp: number;
    xp_to_next_level: number;
    total_xp: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class GameApiService {
  private baseUrl: string;
  private config = getCurrentConfig();
  
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Generic API request method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const defaultOptions: RequestInit = {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...options.headers,
        },
        ...options,
      };

      // Add auth token if available (for testing, we'll use a dummy token)
      const token = this.getAuthToken();
      if (token) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          [API_CONFIG.AUTH_HEADER]: `${API_CONFIG.TOKEN_PREFIX}${token}`,
        };
      }

      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get auth token (for now, return a test token)
  private getAuthToken(): string | null {
    // In a real app, this would get the token from localStorage, cookies, or auth context
    return 'test-token-123';
  }

  // Health check
  async checkHealth(): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.makeRequest(API_CONFIG.ENDPOINTS.HEALTH);
  }

  // Get games list
  async getGames(subject?: string): Promise<ApiResponse<{ games: GameData[]; total: number }>> {
    const params = subject ? { subject } : undefined;
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GAMES, params);
    return this.makeRequest(url.replace(this.baseUrl, ''));
  }

  // Get game details
  async getGameDetails(gameId: string): Promise<ApiResponse<{ game: GameData }>> {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.GAME_DETAILS}/${gameId}`);
  }

  // Get student statistics
  async getStudentStats(): Promise<ApiResponse<{ stats: StudentStats }>> {
    return this.makeRequest(API_CONFIG.ENDPOINTS.STUDENT_STATS);
  }

  // Get achievements
  async getAchievements(): Promise<ApiResponse<{ achievements: any[] }>> {
    return this.makeRequest(API_CONFIG.ENDPOINTS.ACHIEVEMENTS);
  }

  // Get leaderboard
  async getLeaderboard(): Promise<ApiResponse<{ leaderboard: any[] }>> {
    return this.makeRequest(API_CONFIG.ENDPOINTS.LEADERBOARD);
  }

  // Start game session
  async startGameSession(gameId: string): Promise<ApiResponse<{ session_id: string; game: GameData }>> {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.GAME_START}/${gameId}/start`, {
      method: 'POST',
    });
  }

  // Complete game session
  async completeGameSession(
    gameId: string,
    sessionId: string,
    gameData: {
      score: number;
      time_spent: number;
      xp_earned: number;
      game_state?: any;
    }
  ): Promise<ApiResponse<{ xp_earned: number; achievements: any[] }>> {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.GAME_COMPLETE}/${gameId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        ...gameData,
      }),
    });
  }
}

// Create and export singleton instance
export const gameApiService = new GameApiService();

// Export the class for testing
export default GameApiService;
