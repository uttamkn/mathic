"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, Filter, Calendar } from "lucide-react"
import { getResultsSortedBy, clearAllData, type GameResult } from "@/lib/statistics" // Updated import
import { Navbar } from "@/components/navbar"

export default function ResultsPage() {
  const [results, setResults] = useState<GameResult[]>([])
  const [filteredResults, setFilteredResults] = useState<GameResult[]>([])
  const [sortBy, setSortBy] = useState<"date" | "score" | "accuracy">("date")
  const [filterBy, setFilterBy] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const loadResults = useCallback(() => {
    try {
      const sortedResults = getResultsSortedBy(sortBy)
      setResults(sortedResults)
      setLoading(false)
    } catch (error) {
      console.error("Error loading results:", error)
      setLoading(false)
    }
  }, [sortBy])

  const applyFilters = useCallback(() => {
    let filtered = [...results]

    // Apply challenge type filter
    if (filterBy !== "all") {
      filtered = filtered.filter((result) => result.challengeType === filterBy)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return b.timestamp - a.timestamp
        case "score":
          return b.score - a.score
        case "accuracy":
          return b.accuracy - a.accuracy
        default:
          return b.timestamp - a.timestamp
      }
    })

    setFilteredResults(filtered)
  }, [results, sortBy, filterBy])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all results? This cannot be undone.")) {
      if (clearAllData()) {
        setResults([])
        setFilteredResults([])
      } else {
        alert("Failed to clear data. Please try again.")
      }
    }
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

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${totalSeconds}s`
    }
  }

  const getChallengeColor = (challengeType: string) => {
    const colors: { [key: string]: string } = {
      arithmetic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "mental-math": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "speed-drill": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "number-sequences": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      estimation: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "mixed-challenge": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    }
    return colors[challengeType] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  const getUniqueChallengTypes = () => {
    const types = [...new Set(results.map((r) => r.challengeType))]
    return types
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-2xl text-gray-600 dark:text-gray-400">Loading results...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button onClick={handleClearData} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4">Your Results</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Complete history of your math practice sessions</p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 dark:text-gray-400 mb-4">No results yet!</p>
            <p className="text-lg text-gray-400 dark:text-gray-500 mb-8">
              Complete some challenges to see your results here.
            </p>
            <Link href="/">
              <Button className="h-12 px-8 text-lg">Start Practicing</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500 mb-1">{results.length}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500 mb-1">
                    {results.length > 0
                      ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-1">
                    {Math.max(...results.map((r) => r.streak || 0), 0)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500 mb-1">
                    {results.length > 0
                      ? formatTime(
                          Math.round(
                            results.reduce((sum, r) => sum + r.timeSpent, 0) /
                              results.reduce((sum, r) => sum + r.totalQuestions, 0),
                          ),
                        )
                      : "0s"}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Time/Question</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Sorting */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue placeholder="Filter by challenge" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectItem value="all">All Challenges</SelectItem>
                    {getUniqueChallengTypes().map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Select value={sortBy} onValueChange={(value: "date" | "score" | "accuracy") => setSortBy(value)}>
                  <SelectTrigger className="w-40 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="score">Sort by Score</SelectItem>
                    <SelectItem value="accuracy">Sort by Accuracy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Table */}
            <Card className="dark:bg-gray-900 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Practice Sessions ({filteredResults.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={getChallengeColor(result.challengeType)}>{result.challengeName}</Badge>
                        {result.difficulty && (
                          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            {result.difficulty}
                          </Badge>
                        )}
                        {result.operation && (
                          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            {result.operation}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">
                            {result.score}/{result.totalQuestions}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Score</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`font-medium ${result.accuracy >= 80 ? "text-green-600" : result.accuracy >= 60 ? "text-yellow-600" : "text-red-600"}`}
                          >
                            {result.accuracy}%
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{formatTime(result.timeSpent)}</div>
                          <div className="text-gray-500 dark:text-gray-400">Time</div>
                        </div>
                        {result.streak && result.streak > 0 && (
                          <div className="text-center">
                            <div className="font-medium text-orange-600">{result.streak}</div>
                            <div className="text-gray-500 dark:text-gray-400">Streak</div>
                          </div>
                        )}
                        <div className="text-center min-w-[120px]">
                          <div className="font-medium">{formatDate(result.timestamp)}</div>
                          <div className="text-gray-500 dark:text-gray-400">Date</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
