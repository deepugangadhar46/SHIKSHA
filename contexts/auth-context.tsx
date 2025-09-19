"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { AuthService, db, UserData } from "@/lib/db/indexed-db"
import { offlineDB } from "@/lib/db/offline-db-manager"
import { storageAdapter } from "@/lib/storage-adapter"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: "student" | "teacher" | "admin"
  grade?: number
  school?: string
  preferences: {
    language: string
    theme: string
    notifications: boolean
    soundEnabled: boolean
    reducedMotion: boolean
  }
  culturalBackground?: {
    region: string
    language: string
    festivals: string[]
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (userData: Partial<User> & { password: string }) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  useEffect(() => {
    // Initialize database and check session
    const init = async () => {
      try {
        await db.open()
        await checkExistingSession()
      } catch (error) {
        console.error('Failed to initialize database:', error)
      }
    }
    init()
  }, [])

  const checkExistingSession = async () => {
    try {
      // Check both localStorage (remember me) and sessionStorage (current session)
      let savedToken = localStorage.getItem("shiksha-token") || sessionStorage.getItem("shiksha-token")
      let isRemembered = localStorage.getItem("shiksha-remember") === "true"
      
      if (savedToken) {
        const userData = await storageAdapter.validateSession(savedToken)
        if (userData) {
          const user: User = {
            id: userData.id!.toString(),
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar || (userData.role === "teacher" ? "👩‍🏫" : "👨‍🎓"),
            role: userData.role,
            grade: userData.grade,
            school: userData.school,
            preferences: userData.preferences,
            culturalBackground: userData.culturalBackground || userData.cultural_background,
          }
          setSessionToken(savedToken)
          setState((prev) => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }))
          
          // If user was remembered, ensure token stays in localStorage
          if (isRemembered) {
            localStorage.setItem("shiksha-token", savedToken)
          }
        } else {
          // Invalid token, clear all storage
          localStorage.removeItem("shiksha-token")
          localStorage.removeItem("shiksha-remember")
          sessionStorage.removeItem("shiksha-token")
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }))
        }
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }))
      }
    } catch (error) {
      console.error("Error checking session:", error)
      // Clear all storage on error
      localStorage.removeItem("shiksha-token")
      localStorage.removeItem("shiksha-remember")
      sessionStorage.removeItem("shiksha-token")
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to restore session",
      }))
    }
  }

  const login = async (usernameOrEmail: string, password: string, rememberMe: boolean = false) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Use storage adapter (cloud first, IndexedDB fallback)
      const { user: userData, token } = await storageAdapter.login(usernameOrEmail, password)
      
      const user: User = {
        id: userData.id!.toString(),
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || (userData.role === "teacher" ? "👩‍🏫" : "👨‍🎓"),
        role: userData.role,
        grade: userData.grade,
        school: userData.school,
        preferences: userData.preferences,
        culturalBackground: userData.culturalBackground || userData.cultural_background,
      }

      // Store token based on remember me preference
      if (rememberMe) {
        // Store in localStorage for persistent login
        localStorage.setItem("shiksha-token", token)
        localStorage.setItem("shiksha-remember", "true")
        // Also clear any session storage
        sessionStorage.removeItem("shiksha-token")
      } else {
        // Store in sessionStorage for session-only login
        sessionStorage.setItem("shiksha-token", token)
        // Clear localStorage if it exists
        localStorage.removeItem("shiksha-token")
        localStorage.removeItem("shiksha-remember")
      }
      
      setSessionToken(token)

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Login failed. Please check your credentials.",
      }))
    }
  }

  const register = async (userData: Partial<User> & { password: string }) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Use storage adapter (cloud first, IndexedDB fallback)
      const registrationData = {
        name: userData.name || "New User",
        email: userData.email || "",
        password: userData.password,
        role: userData.role || "student",
        grade: userData.grade,
        school: userData.school || "Government School",
      }

      const { user: registeredUser } = await storageAdapter.register(registrationData)
      
      // Auto-login after registration
      const { user: loggedInUser, token } = await storageAdapter.login(userData.email!, userData.password)
      
      const user: User = {
        id: loggedInUser.id!.toString(),
        name: loggedInUser.name,
        email: loggedInUser.email,
        avatar: loggedInUser.avatar || (loggedInUser.role === "teacher" ? "👩‍🏫" : "👨‍🎓"),
        role: loggedInUser.role,
        grade: loggedInUser.grade,
        school: loggedInUser.school,
        preferences: loggedInUser.preferences,
        culturalBackground: loggedInUser.culturalBackground || loggedInUser.cultural_background,
      }

      localStorage.setItem("shiksha-token", token)
      setSessionToken(token)

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Registration failed. Please try again.",
      }))
    }
  }

  const logout = async () => {
    try {
      if (sessionToken) {
        await storageAdapter.logout(sessionToken)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear all storage types
      localStorage.removeItem("shiksha-token")
      localStorage.removeItem("shiksha-remember")
      sessionStorage.removeItem("shiksha-token")
      setSessionToken(null)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const userId = parseInt(state.user.id)
      const updatedUserData = await storageAdapter.updateProfile(userId, {
        name: updates.name,
        email: updates.email,
        avatar: updates.avatar,
        grade: updates.grade,
        school: updates.school,
        preferences: updates.preferences,
        culturalBackground: updates.culturalBackground,
      })

      const updatedUser: User = {
        id: updatedUserData.id!.toString(),
        name: updatedUserData.name,
        email: updatedUserData.email,
        avatar: updatedUserData.avatar || state.user.avatar,
        role: updatedUserData.role,
        grade: updatedUserData.grade,
        school: updatedUserData.school,
        preferences: updatedUserData.preferences,
        culturalBackground: updatedUserData.culturalBackground || updatedUserData.cultural_background,
      }

      setState((prev) => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to update profile",
      }))
    }
  }

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
