import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cloudDB } from '@/lib/server/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, grade, school } = body

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await cloudDB.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user preferences
    const preferences = JSON.stringify({
      language: 'od',
      theme: 'light',
      notifications: true,
      soundEnabled: true,
      reducedMotion: false
    })

    // Create cultural background
    const culturalBackground = JSON.stringify({
      region: 'Odisha',
      language: 'Odia',
      festivals: ['Durga Puja', 'Kali Puja', 'Jagannath Rath Yatra']
    })

    // Create user
    const newUser = await cloudDB.createUser({
      email,
      password: hashedPassword,
      name,
      role: role as 'student' | 'teacher' | 'admin',
      avatar: role === 'teacher' ? '👩‍🏫' : '👨‍🎓',
      grade: grade || null,
      school: school || 'Government School',
      preferences,
      cultural_background: culturalBackground
    })

    // Create initial game stats
    await cloudDB.createGameStats({
      user_id: newUser.id!,
      level: 1,
      total_points: 0,
      current_streak: 0,
      longest_streak: 0,
      badges: JSON.stringify([]),
      achievements: JSON.stringify([]),
      subject_progress: JSON.stringify({
        science: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
        technology: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
        engineering: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
        english: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
        maths: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
        odissi: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 }
      }),
      last_active_date: new Date()
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser
    
    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        preferences: JSON.parse(newUser.preferences),
        cultural_background: newUser.cultural_background ? JSON.parse(newUser.cultural_background) : null
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
