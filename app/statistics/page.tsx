"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, Target, Zap, Brain, Trash2 } from "lucide-react"
import { getStatistics, clearAllData, type Statistics } from "@/lib/statistics" // Updated import
import { Navbar } from "@/components/navbar"

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics>({
    totalGames: 0,
    totalCorrect: 0,
    totalQuestionsAttemptedOverall: 0, // Updated field name
    bestStreak: 0,
    totalOverallTimeSpent: 0, // New field
    averageTimePerQuestionOverall: 0, // Updated field name
    challengeStats: {},
    results: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = () => {
    try {
      const data = getStatistics()
      setStats(
        data || {
          totalGames: 0,
          totalCorrect: 0,
          totalQuestionsAttemptedOverall: 0,
          bestStreak: 0,
          totalOverallTimeSpent: 0,
          averageTimePerQuestionOverall: 0,
          challengeStats: {},
          results: [],
        },
      )
      setLoading(false)
    } catch (error) {
      console.error("Error loading statistics:", error)
      setLoading(false)
    }
  }

  const clearStatistics = () => {
    if (confirm("Are you sure you want to clear all statistics? This cannot be undone.")) {
      if (clearAllData()) {
        setStats({
          totalGames: 0,
          totalCorrect: 0,
          totalQuestionsAttemptedOverall: 0,
          bestStreak: 0,
          totalOverallTimeSpent: 0,
          averageTimePerQuestionOverall: 0,
          challengeStats: {},
          results: [],
        })
      } else {
        alert("Failed to clear statistics. Please try again.")
      }
    }
  }

  const overallAccuracy =
    stats.totalQuestionsAttemptedOverall > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestionsAttemptedOverall) * 100)
      : 0

  const challengeTypes = [
    { key: "arithmetic", name: "Arithmetic", icon: Target, color: "text-blue-500" },
    { key: "mental-math", name: "Mental Math", icon: Brain, color: "text-purple-500" },
    { key: "speed-drill", name: "Speed Drill", icon: Zap, color: "text-yellow-500" },
    { key: "number-sequences", name: "Sequences", icon: TrendingUp, color: "text-green-500" },
    { key: "estimation", name: "Estimation", icon: Target, color: "text-red-500" },
    { key: "mixed-challenge", name: "Mixed", icon: Brain, color: "text-indigo-500" },
  ]

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-2xl text-gray-600 dark:text-gray-400">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button onClick={clearStatistics} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Stats
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4">Your Statistics</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Track your math progress</p>
        </div>

        {stats.totalGames === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 dark:text-gray-400 mb-4">No games played yet!</p>
            <p className="text-lg text-gray-400 dark:text-gray-500">
              Complete some challenges to see your statistics here.
            </p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">{stats.totalGames}</div>
                  <p className="text-gray-600 dark:text-gray-400">Games Played</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">{overallAccuracy}%</div>
                  <p className="text-gray-600 dark:text-gray-400">Overall Accuracy</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">{stats.bestStreak}</div>
                  <p className="text-gray-600 dark:text-gray-400">Best Streak</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-500 mb-2">
                    {stats.averageTimePerQuestionOverall > 0 ? formatTime(stats.averageTimePerQuestionOverall) : "0s"}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Avg. Time/Q</p>
                </CardContent>
              </Card>
            </div>

            {/* Challenge-specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {challengeTypes.map((challenge) => {
                const challengeData = stats.challengeStats[challenge.key]
                const IconComponent = challenge.icon

                return (
                  <Card key={challenge.key} className="dark:bg-gray-900 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg">
                        <IconComponent className={`w-5 h-5 mr-2 ${challenge.color}`} />
                        {challenge.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {challengeData ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Games:</span>
                            <span className="font-medium">{challengeData.played}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accuracy:</span>
                            <span className="font-medium">{challengeData.accuracy}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Best Score:</span>
                            <span className="font-medium">{challengeData.bestScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg. Time/Q:</span>
                            <span className="font-medium">{formatTime(challengeData.averageTimePerQuestion)}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No games played</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Games */}
            {stats.results.length > 0 && (
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.results.slice(0, 10).map((game, index) => (
                      <div
                        key={game.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800"
                      >
                        <div>
                          <span className="font-medium">{game.challengeName}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                            {formatDate(game.timestamp)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {game.score}/{game.totalQuestions}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{game.accuracy}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
