"use client"

import { AuthService, UserData } from './db/indexed-db'
import { offlineDB } from './db/offline-db-manager'

// Storage adapter that prefers cloud API and falls back to IndexedDB
export class StorageAdapter {
  private static instance: StorageAdapter
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : false

  private constructor() {
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.isOnline = true
        console.log('🌐 Back online - using cloud storage')
      })

      window.addEventListener('offline', () => {
        this.isOnline = false
        console.log('📱 Offline - using local storage')
      })
    }
  }

  static getInstance(): StorageAdapter {
    if (!StorageAdapter.instance) {
      StorageAdapter.instance = new StorageAdapter()
    }
    return StorageAdapter.instance
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      // Try cloud API first
      if (this.isOnline) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Cloud login successful')
          
          // Sync to IndexedDB for offline access
          if (offlineDB && data.user) {
            try {
              await this.syncUserToIndexedDB(data.user, password)
            } catch (error) {
              console.warn('Failed to sync user to IndexedDB:', error)
            }
          }
          
          return data
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Login failed')
        }
      }
    } catch (error) {
      console.warn('Cloud login failed, trying IndexedDB:', error)
    }

    // Fallback to IndexedDB
    try {
      const result = await AuthService.login(email, password)
      console.log('📱 IndexedDB login successful')
      return result
    } catch (error) {
      console.error('Both cloud and local login failed:', error)
      throw error
    }
  }

  async register(userData: any): Promise<any> {
    try {
      // Try cloud API first
      if (this.isOnline) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Cloud registration successful')
          
          // Sync to IndexedDB for offline access
          if (offlineDB && data.user) {
            try {
              await this.syncUserToIndexedDB(data.user, userData.password)
            } catch (error) {
              console.warn('Failed to sync user to IndexedDB:', error)
            }
          }
          
          return data
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Registration failed')
        }
      }
    } catch (error) {
      console.warn('Cloud registration failed, trying IndexedDB:', error)
    }

    // Fallback to IndexedDB
    try {
      const result = await AuthService.register(userData)
      console.log('📱 IndexedDB registration successful')
      return result
    } catch (error) {
      console.error('Both cloud and local registration failed:', error)
      throw error
    }
  }

  async validateSession(token: string): Promise<any> {
    try {
      // Try cloud API first
      if (this.isOnline) {
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Cloud session validation successful')
          return data.user
        }
      }
    } catch (error) {
      console.warn('Cloud session validation failed, trying IndexedDB:', error)
    }

    // Fallback to IndexedDB
    try {
      const user = await AuthService.validateSession(token)
      if (user) {
        console.log('📱 IndexedDB session validation successful')
      }
      return user
    } catch (error) {
      console.error('Both cloud and local session validation failed:', error)
      return null
    }
  }

  async logout(token: string): Promise<void> {
    try {
      // Try cloud API first
      if (this.isOnline) {
        await fetch('/api/auth/validate', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })
        console.log('✅ Cloud logout successful')
      }
    } catch (error) {
      console.warn('Cloud logout failed:', error)
    }

    // Always try IndexedDB logout as well
    try {
      await AuthService.logout(token)
      console.log('📱 IndexedDB logout successful')
    } catch (error) {
      console.warn('IndexedDB logout failed:', error)
    }
  }

  async updateProfile(userId: number, updates: any): Promise<any> {
    try {
      // Try cloud API first
      if (this.isOnline) {
        // Note: You'll need to implement this API endpoint
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Cloud profile update successful')
          
          // Sync to IndexedDB
          if (offlineDB) {
            try {
              await AuthService.updateProfile(userId, updates)
            } catch (error) {
              console.warn('Failed to sync profile update to IndexedDB:', error)
            }
          }
          
          return data.user
        }
      }
    } catch (error) {
      console.warn('Cloud profile update failed, trying IndexedDB:', error)
    }

    // Fallback to IndexedDB
    try {
      const result = await AuthService.updateProfile(userId, updates)
      console.log('📱 IndexedDB profile update successful')
      return result
    } catch (error) {
      console.error('Both cloud and local profile update failed:', error)
      throw error
    }
  }

  // Helper method to sync user data to IndexedDB
  private async syncUserToIndexedDB(cloudUser: any, password: string): Promise<void> {
    if (!offlineDB) return

    try {
      // Convert cloud user format to IndexedDB format
      const indexedDBUser: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'> = {
        email: cloudUser.email,
        password: password, // Store original password for offline auth
        name: cloudUser.name,
        role: cloudUser.role,
        avatar: cloudUser.avatar,
        grade: cloudUser.grade,
        school: cloudUser.school,
        preferences: cloudUser.preferences,
        culturalBackground: cloudUser.cultural_background
      }

      // Check if user exists in IndexedDB
      const existingUser = await offlineDB.getUser(cloudUser.email)
      if (existingUser) {
        // Update existing user
        await offlineDB.updateUser(existingUser.id!, indexedDBUser)
      } else {
        // Create new user
        await offlineDB.saveUser(indexedDBUser)
      }
    } catch (error) {
      console.error('Failed to sync user to IndexedDB:', error)
    }
  }

  // Game stats methods
  async saveGameStats(userId: number, stats: any): Promise<void> {
    try {
      // Try cloud API first (you'll need to implement this endpoint)
      if (this.isOnline) {
        await fetch(`/api/users/${userId}/game-stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stats),
        })
        console.log('✅ Cloud game stats saved')
      }
    } catch (error) {
      console.warn('Cloud game stats save failed:', error)
    }

    // Always save to IndexedDB as backup
    if (offlineDB) {
      try {
        await offlineDB.saveGameStats({ ...stats, userId })
        console.log('📱 IndexedDB game stats saved')
      } catch (error) {
        console.warn('IndexedDB game stats save failed:', error)
      }
    }
  }

  // Lesson progress methods
  async saveLessonProgress(userId: number, progress: any): Promise<void> {
    try {
      // Try cloud API first (you'll need to implement this endpoint)
      if (this.isOnline) {
        await fetch(`/api/users/${userId}/lesson-progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(progress),
        })
        console.log('✅ Cloud lesson progress saved')
      }
    } catch (error) {
      console.warn('Cloud lesson progress save failed:', error)
    }

    // Always save to IndexedDB as backup
    if (offlineDB) {
      try {
        await offlineDB.saveLessonProgress({ ...progress, userId })
        console.log('📱 IndexedDB lesson progress saved')
      } catch (error) {
        console.warn('IndexedDB lesson progress save failed:', error)
      }
    }
  }

  // Check if online
  isCloudAvailable(): boolean {
    return this.isOnline
  }
}

// Export singleton instance
export const storageAdapter = StorageAdapter.getInstance()
