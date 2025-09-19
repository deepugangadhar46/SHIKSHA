"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts"
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  BarChart3, 
  FolderOpen,
  Plus,
  MessageSquare,
  PenTool,
  CheckCircle,
  Play,
  AlertTriangle,
  Calendar,
  FileText,
  LogOut,
  Settings,
  Bell
} from "lucide-react"

interface StudentData {
  id: string
  name: string
  grade: number
  avatar: string
  stats: {
    level: number
    xp: number
    totalPoints: number
    currentStreak: number
    longestStreak: number
    lessonsCompleted: number
    quizzesCompleted: number
    averageScore: number
    timeSpent: number // in minutes
    lastActive: Date
  }
  subjects: {
    [key: string]: {
      level: number
      progress: number
      strugglingAreas: string[]
      strengths: string[]
    }
  }
  badges: number
  languagePreference: string
}

// Utility functions for analytics calculations
const analyticsUtils = {
  calculateStudentTrends: (quizScores: number[]): "improving" | "declining" | "stable" => {
    if (!quizScores || quizScores.length < 2) return "stable"
    const mid = Math.floor(quizScores.length / 2)
    const firstHalfAvg = Math.round(quizScores.slice(0, mid).reduce((a, b) => a + b, 0) / mid)
    const secondHalfAvg = Math.round(quizScores.slice(mid).reduce((a, b) => a + b, 0) / (quizScores.length - mid))
    if (secondHalfAvg - firstHalfAvg > 3) return "improving"
    if (firstHalfAvg - secondHalfAvg > 3) return "declining"
    return "stable"
  },
  identifyWeakConcepts: (studentAnswers: Array<{ concept: string; correct: boolean }>) => {
    const counts: Record<string, { total: number; correct: number }> = {}
    studentAnswers.forEach(a => {
      counts[a.concept] = counts[a.concept] || { total: 0, correct: 0 }
      counts[a.concept].total += 1
      counts[a.concept].correct += a.correct ? 1 : 0
    })
    return Object.entries(counts)
      .map(([concept, { total, correct }]) => ({ concept, accuracy: Math.round((correct / total) * 100) }))
      .filter(c => c.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
  },
  generateInsights: (classData: StudentData[]) => {
    const insights: Array<{ text: string; priority: "red" | "yellow" | "green" }> = []
    // Students inactive or low scores
    classData.forEach(s => {
      if (s.stats.averageScore < 60) {
        insights.push({ text: `${s.name} needs attention (avg < 60%). Consider a revision session.`, priority: "red" })
      }
    })
    // Top performers
    const top = [...classData].sort((a, b) => b.stats.averageScore - a.stats.averageScore).slice(0, 5)
    if (top.length) insights.push({ text: `Top ${top.length} students ready for advanced content: ${top.map(t => t.name).join(", ")}` , priority: "green" })
    // Engagement drop
    const lowEngagement = classData.filter(s => s.stats.timeSpent < 200)
    if (lowEngagement.length) insights.push({ text: `${lowEngagement.length} students have low engagement this week.`, priority: "yellow" })
    return insights
  },
  colorCodePerformance: (score: number) => {
    if (score > 75) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  },
  formatAnalyticsData: (raw: any) => raw,
  calculateClassAverage: (scores: number[]) => (scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0),
}

// Realtime WebSocket handler hook (mock with reconnect/backoff)
function useRealtimeAnalytics(classId: string) {
  const [state, setState] = useState({
    taking: [] as Array<{ id: string; name: string; endsAt: number }>,
    completed: [] as Array<{ id: string; name: string; score: number; submittedAt: number }>,
  })
  const [status, setStatus] = useState<"connecting" | "open" | "error" | "closed">("connecting")
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    function connect() {
      try {
        setStatus("connecting")
        // Replace with actual endpoint
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "wss://example.com"}/realtime?classId=${classId}`)
        wsRef.current = ws
        ws.onopen = () => {
          if (cancelled) return
          setStatus("open")
          retryRef.current = 0
        }
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data)
            if (msg.type === "quiz_started") {
              setState(prev => ({ ...prev, taking: [...prev.taking, msg.payload] }))
            } else if (msg.type === "quiz_completed") {
              setState(prev => ({ ...prev, taking: prev.taking.filter(t => t.id !== msg.payload.id), completed: [msg.payload, ...prev.completed].slice(0, 10) }))
            }
          } catch {}
        }
        ws.onerror = () => {
          setStatus("error")
        }
        ws.onclose = () => {
          setStatus("closed")
          if (!cancelled) {
            const timeout = Math.min(30000, 1000 * Math.pow(2, retryRef.current++))
            setTimeout(connect, timeout)
          }
        }
      } catch {
        setStatus("error")
      }
    }
    connect()
    return () => {
      cancelled = true
      wsRef.current?.close()
    }
  }, [classId])

  return { ...state, status }
}

// Student Performance Matrix Component
function StudentPerformanceMatrix({ students }: { students: StudentData[] }) {
  const subjects = useMemo(() => {
    const set = new Set<string>()
    students.forEach(s => Object.keys(s.subjects).forEach(sub => set.add(sub)))
    return Array.from(set)
  }, [students])

  const [filter, setFilter] = useState<"all" | "struggling" | "top" | "improving">("all")

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (filter === "all") return true
      const scores = Object.values(s.subjects).map(v => v.progress)
      const avg = analyticsUtils.calculateClassAverage(scores)
      if (filter === "struggling") return avg < 60
      if (filter === "top") return avg > 85
      if (filter === "improving") return true // placeholder, would need trends
      return true
    })
  }, [students, filter])

  const failingCount = (s: StudentData) => Object.values(s.subjects).filter(v => v.progress < 60).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
        <Button size="sm" variant={filter === "struggling" ? "destructive" : "outline"} onClick={() => setFilter("struggling")}>Struggling</Button>
        <Button size="sm" variant={filter === "top" ? "default" : "outline"} onClick={() => setFilter("top")}>Top Performers</Button>
        <Button size="sm" variant={filter === "improving" ? "default" : "outline"} onClick={() => setFilter("improving")}>Improving</Button>
      </div>
      <div className="overflow-auto">
        <div className="min-w-[700px]">
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${subjects.length}, minmax(100px, 1fr))` }}>
            <div className="p-2 text-sm font-semibold">Student</div>
            {subjects.map(sub => (
              <div key={sub} className="p-2 text-sm font-semibold capitalize">{sub}</div>
            ))}
            {filtered.map((s) => (
              <div className="contents" key={s.id}>
                <div className="p-2 border-t flex items-center gap-2">
                  <span className="text-lg">{s.avatar}</span>
                  <span className="text-sm font-medium">{s.name}</span>
                  {failingCount(s) >= 2 && (
                    <Badge variant="destructive" className="ml-2">2+ Alerts</Badge>
                  )}
                </div>
                {subjects.map(sub => {
                  const perf = s.subjects[sub]?.progress ?? 0
                  return (
                    <div key={`${s.id}-${sub}`} className={`p-2 border-t text-center text-sm rounded ${analyticsUtils.colorCodePerformance(perf)}`}>
                      {perf}%
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Real-Time Quiz Monitor
function RealTimeQuizMonitor({ classId }: { classId: string }) {
  const { taking, completed, status } = useRealtimeAnalytics(classId)
  const [now, setNow] = useState(Date.now())

  // Auto-refresh timers
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Fallback polling every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      // no-op placeholder for REST refresh
    }, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Currently Taking Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taking.length === 0 && <div className="text-sm text-muted-foreground">No active attempts</div>}
            {taking.map(s => {
              const remaining = Math.max(0, Math.floor((s.endsAt - now) / 1000))
              const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
              const ss = String(remaining % 60).padStart(2, '0')
              return (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <Badge className={remaining < 60 ? 'bg-red-600 hover:bg-red-600' : ''}>{mm}:{ss}</Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Just Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completed.length === 0 && <div className="text-sm text-muted-foreground">No recent submissions</div>}
            {completed.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {s.score < 50 && <Badge variant="destructive">Needs Attention</Badge>}
                  <Badge variant="outline">{s.score}%</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">Connection: {status}</div>
        </CardContent>
      </Card>
    </div>
  )
}

// Concept Breakdown Widget
function ConceptBreakdown({ subjectData, students }: { subjectData: Array<{ topic: string; passed: number; total: number }>; students: StudentData[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const topics = subjectData
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Concept Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topics.map(t => {
            const pct = Math.round((t.passed / t.total) * 100)
            return (
              <div key={t.topic} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <button className="text-left font-medium hover:underline" onClick={() => setSelected(t.topic)}>{t.topic}</button>
                  <span className="text-primary font-semibold">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
                <div className="text-xs text-muted-foreground">{t.passed}/{t.total} students passed</div>
              </div>
            )
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{selected ? `Students needing help in ${selected}` : 'Select a topic'}</CardTitle>
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="space-y-2 max-h-72 overflow-auto">
              {students.slice(0, 24).map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span>{s.avatar}</span>
                    <span className="text-sm">{s.name}</span>
                  </div>
                  <Badge variant="outline">Grade {s.grade}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Click a topic to view student details</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Student Profile Card
function StudentProfileCard({ student }: { student: StudentData }) {
  const [expanded, setExpanded] = useState(false)
  const trendScores = useMemo(() => Array.from({ length: 10 }, () => Math.floor(Math.random() * 41) + 60), [])
  const strongest = useMemo(() => {
    const entries = Object.entries(student.subjects)
    return entries.sort((a, b) => b[1].progress - a[1].progress)[0]?.[0]
  }, [student])
  const weakest = useMemo(() => {
    const entries = Object.entries(student.subjects)
    return entries.sort((a, b) => a[1].progress - b[1].progress)[0]?.[0]
  }, [student])

  const data = trendScores.map((v, i) => ({ idx: i + 1, score: v }))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{student.avatar}</span>
            <div>
              <div className="font-semibold">{student.name}</div>
              <div className="text-xs text-muted-foreground">Level {student.stats.level} • Avg {student.stats.averageScore}%</div>
            </div>
          </div>
          <Badge variant="outline">{student.languagePreference.toUpperCase()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm">Strongest: <span className="font-medium capitalize">{strongest}</span></div>
          <div className="text-sm">Weakest: <span className="font-medium capitalize">{weakest}</span></div>
        </div>
        {expanded && (
          <div className="space-y-4">
            <div className="h-40">
              <ChartContainer config={{ score: { label: 'Score', color: 'hsl(var(--primary))' }}}>
                <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="idx" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ChartContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(student.subjects).map(([sub, info]) => (
                <div key={sub} className="p-3 rounded-lg bg-muted/40">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{sub}</span>
                    <span className="font-medium">{info.progress}%</span>
                  </div>
                  <Progress value={info.progress} className="h-1.5 mt-1" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Actionable Insights Panel
function ActionableInsights({ students }: { students: StudentData[] }) {
  const insights = useMemo(() => analyticsUtils.generateInsights(students), [students])
  const color = (p: "red" | "yellow" | "green") => p === 'red' ? 'border-red-500/40 bg-red-500/10' : p === 'yellow' ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-green-500/40 bg-green-500/10'
  return (
    <div className="space-y-3">
      {insights.map((i, idx) => (
        <div key={idx} className={`p-3 rounded-lg border ${color(i.priority)} flex items-center justify-between`}>
          <div className="text-sm">{i.text}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">Create Action</Button>
            <Button size="sm" variant="outline">Dismiss</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Analytics Dashboard Container
function StudentAnalyticsDashboard({ students }: { students: StudentData[] }) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => students.filter(s => s.name.toLowerCase().includes(query.toLowerCase())), [students, query])
  const conceptData = useMemo(() => ([
    { topic: "Algebra / बीजगणित / ବୀଜଗାଣିତ", passed: 18, total: 24 },
    { topic: "Geometry / ज्यामिति / ଯାମିତି", passed: 20, total: 24 },
    { topic: "Fractions / भिन्न / ଭାଗ", passed: 16, total: 24 },
  ]), [])

  function exportReport() {
    // Simple CSV export of averages
    const lines = ["Name,Average Score"].concat(filtered.map(s => `${s.name},${s.stats.averageScore}`))
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'class-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
          className="w-full sm:w-64 px-3 py-2 rounded-md border bg-background"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>Export Report</Button>
        </div>
      </div>

      <Card className="p-4">
        <StudentPerformanceMatrix students={filtered} />
      </Card>

      <RealTimeQuizMonitor classId="8A" />

      <Card className="p-4">
        <ConceptBreakdown subjectData={conceptData} students={filtered} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 9).map(s => (
          <StudentProfileCard key={s.id} student={s} />
        ))}
      </div>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionableInsights students={filtered} />
        </CardContent>
      </Card>
    </div>
  )
}

const sampleStudents: StudentData[] = [
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
  {
    id: "3",
    name: "Meera Singh",
    grade: 8,
    avatar: "👩‍🎓",
    stats: {
      level: 7,
      xp: 580,
      totalPoints: 2890,
      currentStreak: 8,
      longestStreak: 14,
      lessonsCompleted: 28,
      quizzesCompleted: 20,
      averageScore: 78,
      timeSpent: 350,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    subjects: {
      math: { level: 6, progress: 72, strugglingAreas: ["Algebra"], strengths: ["Arithmetic", "Geometry"] },
      science: { level: 7, progress: 80, strugglingAreas: [], strengths: ["Biology", "Environmental Science"] },
      english: { level: 8, progress: 85, strugglingAreas: [], strengths: ["Reading", "Writing"] },
    },
    badges: 9,
    languagePreference: "hi",
  },
  // Generate additional students to reach 24 total
  ...Array.from({ length: 21 }, (_, i) => ({
    id: `${i + 4}`,
    name: `Student ${i + 4}`,
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

interface TeacherDashboardProps {
  className?: string
}

export function TeacherDashboard({ className = "" }: TeacherDashboardProps) {
  const [students, setStudents] = useState<StudentData[]>(sampleStudents)
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const { language, t } = useLanguage()
  const { logout, user } = useAuth()
  const router = useRouter()

  const classStats = {
    totalStudents: 24,
    averageLevel: 9.2,
    averageEngagement: Math.round(students.reduce((acc, s) => acc + s.stats.timeSpent, 0) / students.length),
    averageScore: Math.round(students.reduce((acc, s) => acc + s.stats.averageScore, 0) / students.length),
    activeToday: 18,
    strugglingStudents: students.filter((s) => s.stats.averageScore < 70).length,
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
    } else {
      return "Just now"
    }
  }

  const getEngagementColor = (timeSpent: number) => {
    if (timeSpent >= 300) return "text-green-600 bg-green-100"
    if (timeSpent >= 180) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100"
    if (score >= 70) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {language === "od" ? "ଶିକ୍ଷକ ଡ୍ୟାସବୋର୍ଡ" : language === "hi" ? "शिक्षक डैशबोर्ड" : "Teacher Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {language === "od" ? `ପୁନର୍ବାର ସ୍ୱାଗତ, ${user?.name || "ଶିକ୍ଷକ"}!` : 
                 language === "hi" ? `वापस स्वागत है, ${user?.name || "शिक्षक"}!` : 
                 `Welcome back, ${user?.name || "Teacher"}!`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => {}}
            >
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => {}}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <div className="bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/20">
              <span className="text-primary text-sm font-medium">Grade 8A (24 students)</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
              onClick={async () => {
                await logout()
                router.push('/')
              }}
            >
              <LogOut className="w-4 h-4" />
              {language === "od" ? "ଲଗଆଉଟ୍" : language === "hi" ? "लॉगआउट" : "Logout"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-card p-1 rounded-xl">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="students" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
          >
            <Users className="w-4 h-4" />
            Students
          </TabsTrigger>
          <TabsTrigger 
            value="assignments" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            Resources
          </TabsTrigger>
        </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Total Students */}
              <div className="glass-card p-6 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{classStats.totalStudents}</div>
                    <div className="text-muted-foreground text-sm">Total Students</div>
                  </div>
                </div>
              </div>

              {/* Active Today */}
              <div className="glass-card p-6 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{classStats.activeToday}</div>
                    <div className="text-muted-foreground text-sm">Active Today</div>
                  </div>
                </div>
              </div>

              {/* Average Level */}
              <div className="glass-card p-6 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{classStats.averageLevel}</div>
                    <div className="text-muted-foreground text-sm">Avg Level</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground font-medium">Priya Sharma</div>
                      <div className="text-muted-foreground text-sm">Completed Chemistry Lab</div>
                    </div>
                    <div className="text-muted-foreground text-sm">1 hour ago</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground font-medium">Arjun Patel</div>
                      <div className="text-muted-foreground text-sm">Started Physics Module</div>
                    </div>
                    <div className="text-muted-foreground text-sm">2 hours ago</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground font-medium">Meera Singh</div>
                      <div className="text-muted-foreground text-sm">Needs help with Algebra</div>
                    </div>
                    <div className="text-muted-foreground text-sm">1 day ago</div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl text-white text-left shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    <div className="font-medium">Create Assignment</div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-green-500 to-teal-600 p-4 rounded-xl text-white text-left shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <div className="font-medium">View Analytics</div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-orange-500 to-yellow-600 p-4 rounded-xl text-white text-left shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <MessageSquare className="w-6 h-6 mb-2" />
                    <div className="font-medium">Message Students</div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-xl text-white text-left shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <BookOpen className="w-6 h-6 mb-2" />
                    <div className="font-medium">Lesson Plans</div>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.slice(0, 12).map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 cursor-pointer card-hover"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{student.avatar}</span>
                  <div className="flex-1">
                    <div className="text-foreground font-medium">{student.name}</div>
                    <div className="text-muted-foreground text-sm">Grade {student.grade} • Level {student.stats.level}</div>
                  </div>
                  <div className="text-primary text-sm font-medium">{student.stats.averageScore}%</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{Math.round(student.stats.xp % 100)}%</span>
                  </div>
                  <Progress value={student.stats.xp % 100} className="h-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Assignments</h3>
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No assignments created yet</p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="glass-card p-6">
            <StudentAnalyticsDashboard students={students} />
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Resources</h3>
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No resources available yet</p>
              <Button className="bg-secondary hover:bg-secondary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
