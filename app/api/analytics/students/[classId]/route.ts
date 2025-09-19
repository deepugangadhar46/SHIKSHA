import { NextRequest, NextResponse } from 'next/server'
import { cloudDB } from '@/lib/server/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId

    // For now, return mock data that matches the teacher dashboard structure
    // In a real implementation, you would query the database for actual student data
    const mockStudents = [
      {
        id: "1",
        name: "Priya Sharma",
        grade: 8,
        avatar: "👩‍🎓",
        stats: {
          level: 10,
          xp: 850,
          totalPoints: 4240,
          currentStreak: 15,
          longestStreak: 22,
          lessonsCompleted: 35,
          quizzesCompleted: 28,
          averageScore: 92,
          timeSpent: 480,
          lastActive: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
        subjects: {
          math: { level: 9, progress: 95, strugglingAreas: [], strengths: ["Algebra", "Geometry"] },
          science: { level: 8, progress: 88, strugglingAreas: [], strengths: ["Physics", "Chemistry"] },
          english: { level: 10, progress: 98, strugglingAreas: [], strengths: ["Literature", "Grammar"] },
        },
        badges: 15,
        languagePreference: "en",
      },
      {
        id: "2",
        name: "Arjun Patel",
        grade: 8,
        avatar: "👨‍🎓",
        stats: {
          level: 8,
          xp: 720,
          totalPoints: 3680,
          currentStreak: 12,
          longestStreak: 18,
          lessonsCompleted: 32,
          quizzesCompleted: 24,
          averageScore: 87,
          timeSpent: 420,
          lastActive: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        },
        subjects: {
          math: { level: 8, progress: 85, strugglingAreas: [], strengths: ["Algebra", "Statistics"] },
          science: { level: 7, progress: 82, strugglingAreas: ["Chemistry"], strengths: ["Physics", "Biology"] },
          odia: { level: 9, progress: 95, strugglingAreas: [], strengths: ["Literature", "Grammar"] },
        },
        badges: 12,
        languagePreference: "od",
      },
      // Add more mock students...
      ...Array.from({ length: 22 }, (_, i) => ({
        id: `${i + 3}`,
        name: `Student ${i + 3}`,
        grade: 8,
        avatar: i % 2 === 0 ? "👨‍🎓" : "👩‍🎓",
        stats: {
          level: Math.floor(Math.random() * 10) + 5,
          xp: Math.floor(Math.random() * 500) + 300,
          totalPoints: Math.floor(Math.random() * 2000) + 1500,
          currentStreak: Math.floor(Math.random() * 15) + 1,
          longestStreak: Math.floor(Math.random() * 25) + 5,
          lessonsCompleted: Math.floor(Math.random() * 30) + 10,
          quizzesCompleted: Math.floor(Math.random() * 20) + 5,
          averageScore: Math.floor(Math.random() * 30) + 70,
          timeSpent: Math.floor(Math.random() * 300) + 200,
          lastActive: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 48), // Random time in last 48 hours
        },
        subjects: {
          math: { level: Math.floor(Math.random() * 8) + 3, progress: Math.floor(Math.random() * 40) + 60, strugglingAreas: [], strengths: ["Basic Math"] },
          science: { level: Math.floor(Math.random() * 8) + 3, progress: Math.floor(Math.random() * 40) + 60, strugglingAreas: [], strengths: ["General Science"] },
          english: { level: Math.floor(Math.random() * 8) + 3, progress: Math.floor(Math.random() * 40) + 60, strugglingAreas: [], strengths: ["Reading"] },
        },
        badges: Math.floor(Math.random() * 10) + 3,
        languagePreference: ["en", "od", "hi"][Math.floor(Math.random() * 3)],
      }))
    ]

    return NextResponse.json({
      success: true,
      students: mockStudents
    })

  } catch (error) {
    console.error('Analytics students error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student analytics' },
      { status: 500 }
    )
  }
}
