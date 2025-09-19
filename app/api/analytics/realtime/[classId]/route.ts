import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId

    // Mock real-time data for quiz monitoring
    const mockRealtimeData = {
      taking: [
        {
          id: "student_1",
          name: "Priya Sharma",
          endsAt: Date.now() + 15 * 60 * 1000, // 15 minutes from now
        },
        {
          id: "student_2", 
          name: "Arjun Patel",
          endsAt: Date.now() + 8 * 60 * 1000, // 8 minutes from now
        }
      ],
      completed: [
        {
          id: "student_3",
          name: "Meera Singh",
          score: 85,
          submittedAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
        },
        {
          id: "student_4",
          name: "Raj Kumar",
          score: 45, // Low score - needs attention
          submittedAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
        },
        {
          id: "student_5",
          name: "Anita Das",
          score: 92,
          submittedAt: Date.now() - 15 * 60 * 1000, // 15 minutes ago
        }
      ]
    }

    return NextResponse.json({
      success: true,
      ...mockRealtimeData
    })

  } catch (error) {
    console.error('Real-time analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time data' },
      { status: 500 }
    )
  }
}
