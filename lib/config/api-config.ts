/**
 * API Configuration for Shiksha Game Integration Platform
 * Public configuration file for API endpoints and settings
 */

// API Base URLs
export const API_CONFIG = {
  // Backend API base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001',
  
  // API Endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    GAMES: '/api/games',
    GAME_DETAILS: '/api/games',
    STUDENT_STATS: '/api/student/stats',
    ACHIEVEMENTS: '/api/achievements',
    LEADERBOARD: '/api/leaderboard',
    GAME_START: '/api/games',
    GAME_COMPLETE: '/api/games',
  },
  
  // Request configuration
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  
  // Authentication
  AUTH_HEADER: 'Authorization',
  TOKEN_PREFIX: 'Bearer ',
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
} as const;

// Game API Service Configuration
export const GAME_API_CONFIG = {
  // Game session settings
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  AUTO_SAVE_INTERVAL: 60 * 1000, // 1 minute
  
  // Offline settings
  OFFLINE_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  SYNC_RETRY_DELAY: 5 * 1000, // 5 seconds
  
  // Performance settings
  MAX_CONCURRENT_REQUESTS: 5,
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Environment-specific configurations
export const ENV_CONFIG = {
  DEVELOPMENT: {
    API_BASE_URL: 'http://127.0.0.1:8001',
    DEBUG_MODE: true,
    ENABLE_LOGGING: true,
  },
  PRODUCTION: {
    API_BASE_URL: 'https://your-production-api.com',
    DEBUG_MODE: false,
    ENABLE_LOGGING: false,
  },
  TESTING: {
    API_BASE_URL: 'http://localhost:8002',
    DEBUG_MODE: true,
    ENABLE_LOGGING: true,
  }
} as const;

// Get current environment configuration
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return ENV_CONFIG.PRODUCTION;
    case 'test':
      return ENV_CONFIG.TESTING;
    default:
      return ENV_CONFIG.DEVELOPMENT;
  }
};

// API URL builder utility
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  const baseUrl = API_CONFIG.BASE_URL;
  let url = `${baseUrl}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Default export for easy importing
export default API_CONFIG;
