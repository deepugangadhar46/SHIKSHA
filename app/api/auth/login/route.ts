import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { cloudDB } from '@/lib/server/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get user by email
    const user = await cloudDB.getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Clean up old sessions for this user
    await cloudDB.deleteUserSessions(user.id!)

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    // Create session
    await cloudDB.createSession({
      user_id: user.id!,
      token,
      expires_at: expiresAt
    })

    // Update last active date in game stats
    const gameStats = await cloudDB.getGameStatsByUserId(user.id!)
    if (gameStats) {
      await cloudDB.updateGameStats(user.id!, {
        last_active_date: new Date()
      })
    }

    // Return user data and token (without password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        preferences: JSON.parse(user.preferences),
        cultural_background: user.cultural_background ? JSON.parse(user.cultural_background) : null
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
