import { NextRequest, NextResponse } from 'next/server'
import { cloudDB } from '@/lib/server/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Get session by token
    const session = await cloudDB.getSessionByToken(token)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user data
    const user = await cloudDB.getUserById(session.user_id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        preferences: JSON.parse(user.preferences),
        cultural_background: user.cultural_background ? JSON.parse(user.cultural_background) : null
      }
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Delete session
    await cloudDB.deleteSession(token)
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
