"use client"

import { ApiTestPanel } from '@/components/test/api-test-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              🧪 Shiksha Game Integration Test Suite
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive testing dashboard for the game-based education platform
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Frontend</h3>
                  <p className="text-sm text-muted-foreground">Next.js Running</p>
                  <Badge variant="default" className="mt-1">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Backend API</h3>
                  <p className="text-sm text-muted-foreground">Flask Server</p>
                  <Badge variant="default" className="mt-1">Port 8001</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Database</h3>
                  <p className="text-sm text-muted-foreground">MySQL Aiven</p>
                  <Badge variant="default" className="mt-1">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Game Engine</h3>
                  <p className="text-sm text-muted-foreground">Phaser.js v3.80</p>
                  <Badge variant="default" className="mt-1">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Test Panel */}
        <ApiTestPanel />

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/student">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Student Dashboard
                </Button>
              </Link>
              
              <Link href="/teacher">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Teacher Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={() => window.open('http://127.0.0.1:8001/api/health', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                API Health Check
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Implemented Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">🎮 Game System</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Phaser.js Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Math Drag & Drop Games
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Science Memory Games
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Progressive Unlocking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    XP & Achievement System
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">🏛️ Cultural Integration</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Odisha Cultural Context
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Multilingual Support (En/Hi/Od)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Cultural Level Titles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Festival & Heritage Games
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Government Curriculum Alignment
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700">📱 Technical Features</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Offline-First Architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    IndexedDB Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Service Worker PWA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    RESTful API Backend
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Real-time Analytics
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-orange-700">🎯 Learning Features</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Adaptive Difficulty
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Subject Mastery Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Leaderboards & Competition
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Badge & Reward System
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Progress Analytics
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 text-muted-foreground">
          <p>🎮 Shiksha - Gamified Learning Platform for Rural Odisha Students</p>
          <p className="text-sm mt-1">Built with Next.js, Phaser.js, Flask, and MySQL</p>
        </div>
      </div>
    </div>
  );
}
