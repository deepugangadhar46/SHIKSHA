import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

// Database connection configuration
const dbConfig = {
  host: process.env.AIVEN_MYSQL_HOST,
  port: parseInt(process.env.AIVEN_MYSQL_PORT || '3306'),
  user: process.env.AIVEN_MYSQL_USER,
  password: process.env.AIVEN_MYSQL_PASSWORD,
  database: process.env.AIVEN_MYSQL_DATABASE,
  ssl: {
    ca: fs.readFileSync(path.join(process.cwd(), 'TOOLS', 'ca(1).pem')),
    rejectUnauthorized: true // Use proper SSL with your certificate
  },
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Test database connection
export async function testConnection() {
  try {
    const connection = await getPool().getConnection()
    await connection.ping()
    connection.release()
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// User interface matching IndexedDB structure
export interface CloudUser {
  id?: number
  email: string
  password: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
  grade?: number
  school?: string
  preferences: string // JSON string
  cultural_background?: string // JSON string
  created_at?: Date
  updated_at?: Date
}

export interface CloudSession {
  id?: number
  user_id: number
  token: string
  expires_at: Date
  created_at?: Date
}

export interface CloudLessonProgress {
  id?: number
  user_id: number
  subject: string
  lesson_id: string
  completed: boolean
  score: number
  attempts: number
  time_spent: number
  completed_at?: Date
  created_at?: Date
  updated_at?: Date
}

export interface CloudGameStats {
  id?: number
  user_id: number
  level: number
  total_points: number
  current_streak: number
  longest_streak: number
  badges: string // JSON string
  achievements: string // JSON string
  subject_progress: string // JSON string
  last_active_date: Date
  created_at?: Date
  updated_at?: Date
}

// Database service class
export class CloudDBService {
  private pool: mysql.Pool

  constructor() {
    this.pool = getPool()
  }

  // User operations
  async createUser(userData: Omit<CloudUser, 'id' | 'created_at' | 'updated_at'>): Promise<CloudUser> {
    const query = `
      INSERT INTO users (email, password, name, role, avatar, grade, school, preferences, cultural_background)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const [result] = await this.pool.execute(query, [
      userData.email,
      userData.password,
      userData.name,
      userData.role,
      userData.avatar || null,
      userData.grade || null,
      userData.school || null,
      userData.preferences,
      userData.cultural_background || null
    ]) as [mysql.ResultSetHeader, any]

    return {
      id: result.insertId,
      ...userData,
      created_at: new Date(),
      updated_at: new Date()
    }
  }

  async getUserByEmail(email: string): Promise<CloudUser | null> {
    const query = 'SELECT * FROM users WHERE email = ?'
    const [rows] = await this.pool.execute(query, [email]) as [mysql.RowDataPacket[], any]
    
    if (rows.length === 0) return null
    
    const user = rows[0]
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      grade: user.grade,
      school: user.school,
      preferences: user.preferences,
      cultural_background: user.cultural_background,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  }

  async getUserById(id: number): Promise<CloudUser | null> {
    const query = 'SELECT * FROM users WHERE id = ?'
    const [rows] = await this.pool.execute(query, [id]) as [mysql.RowDataPacket[], any]
    
    if (rows.length === 0) return null
    
    const user = rows[0]
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      grade: user.grade,
      school: user.school,
      preferences: user.preferences,
      cultural_background: user.cultural_background,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  }

  async updateUser(id: number, updates: Partial<CloudUser>): Promise<void> {
    const fields = Object.keys(updates).filter(key => key !== 'id').map(key => `${key} = ?`)
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id')
      .map(([, value]) => value)
    
    if (fields.length === 0) return

    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`
    await this.pool.execute(query, [...values, id])
  }

  // Session operations
  async createSession(session: Omit<CloudSession, 'id' | 'created_at'>): Promise<CloudSession> {
    const query = 'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
    const [result] = await this.pool.execute(query, [
      session.user_id,
      session.token,
      session.expires_at
    ]) as [mysql.ResultSetHeader, any]

    return {
      id: result.insertId,
      ...session,
      created_at: new Date()
    }
  }

  async getSessionByToken(token: string): Promise<CloudSession | null> {
    const query = 'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()'
    const [rows] = await this.pool.execute(query, [token]) as [mysql.RowDataPacket[], any]
    
    if (rows.length === 0) return null
    
    const session = rows[0]
    return {
      id: session.id,
      user_id: session.user_id,
      token: session.token,
      expires_at: session.expires_at,
      created_at: session.created_at
    }
  }

  async deleteSession(token: string): Promise<void> {
    const query = 'DELETE FROM sessions WHERE token = ?'
    await this.pool.execute(query, [token])
  }

  async deleteUserSessions(userId: number): Promise<void> {
    const query = 'DELETE FROM sessions WHERE user_id = ?'
    await this.pool.execute(query, [userId])
  }

  // Game stats operations
  async createGameStats(stats: Omit<CloudGameStats, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const query = `
      INSERT INTO game_stats (user_id, level, total_points, current_streak, longest_streak, badges, achievements, subject_progress, last_active_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    await this.pool.execute(query, [
      stats.user_id,
      stats.level,
      stats.total_points,
      stats.current_streak,
      stats.longest_streak,
      stats.badges,
      stats.achievements,
      stats.subject_progress,
      stats.last_active_date
    ])
  }

  async getGameStatsByUserId(userId: number): Promise<CloudGameStats | null> {
    const query = 'SELECT * FROM game_stats WHERE user_id = ?'
    const [rows] = await this.pool.execute(query, [userId]) as [mysql.RowDataPacket[], any]
    
    if (rows.length === 0) return null
    
    const stats = rows[0]
    return {
      id: stats.id,
      user_id: stats.user_id,
      level: stats.level,
      total_points: stats.total_points,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
      badges: stats.badges,
      achievements: stats.achievements,
      subject_progress: stats.subject_progress,
      last_active_date: stats.last_active_date,
      created_at: stats.created_at,
      updated_at: stats.updated_at
    }
  }

  async updateGameStats(userId: number, updates: Partial<CloudGameStats>): Promise<void> {
    const fields = Object.keys(updates).filter(key => !['id', 'user_id'].includes(key)).map(key => `${key} = ?`)
    const values = Object.entries(updates)
      .filter(([key]) => !['id', 'user_id'].includes(key))
      .map(([, value]) => value)
    
    if (fields.length === 0) return

    const query = `UPDATE game_stats SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`
    await this.pool.execute(query, [...values, userId])
  }

  // Lesson progress operations
  async saveLessonProgress(progress: Omit<CloudLessonProgress, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const checkQuery = 'SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?'
    const [existing] = await this.pool.execute(checkQuery, [progress.user_id, progress.lesson_id]) as [mysql.RowDataPacket[], any]

    if (existing.length > 0) {
      // Update existing
      const updateQuery = `
        UPDATE lesson_progress 
        SET subject = ?, completed = ?, score = ?, attempts = attempts + 1, time_spent = time_spent + ?, completed_at = ?, updated_at = NOW()
        WHERE user_id = ? AND lesson_id = ?
      `
      await this.pool.execute(updateQuery, [
        progress.subject,
        progress.completed,
        progress.score,
        progress.time_spent,
        progress.completed_at || null,
        progress.user_id,
        progress.lesson_id
      ])
    } else {
      // Create new
      const insertQuery = `
        INSERT INTO lesson_progress (user_id, subject, lesson_id, completed, score, attempts, time_spent, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
      await this.pool.execute(insertQuery, [
        progress.user_id,
        progress.subject,
        progress.lesson_id,
        progress.completed,
        progress.score,
        progress.attempts,
        progress.time_spent,
        progress.completed_at || null
      ])
    }
  }

  async getLessonProgressByUser(userId: number): Promise<CloudLessonProgress[]> {
    const query = 'SELECT * FROM lesson_progress WHERE user_id = ?'
    const [rows] = await this.pool.execute(query, [userId]) as [mysql.RowDataPacket[], any]
    
    return rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      subject: row.subject,
      lesson_id: row.lesson_id,
      completed: row.completed,
      score: row.score,
      attempts: row.attempts,
      time_spent: row.time_spent,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }))
  }
}

// Export singleton instance
export const cloudDB = new CloudDBService()
