export interface GameResult {
  id: string
  challengeType: string
  challengeName: string
  difficulty?: string
  operation?: string
  score: number
  totalQuestions: number
  accuracy: number // (score / totalQuestions) * 100
  timeSpent: number // seconds
  date: string // ISO string
  timestamp: number // unix ms
  streak?: number
}

export interface Statistics {
  totalGames: number
  totalCorrect: number
  totalQuestionsAttemptedOverall: number
  bestStreak: number
  totalOverallTimeSpent: number
  averageTimePerQuestionOverall: number
  challengeStats: {
    [key: string]: {
      played: number
      accuracy: number
      bestScore: number
      totalTimeSpent: number
      totalQuestionsAttempted: number
      averageTimePerQuestion: number
    }
  }
  results: GameResult[]
}

////////////////////////////
// Helpers
////////////////////////////
const STORAGE_KEY = "mathiks-data"

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

const getEmptyStats = (): Statistics => ({
  totalGames: 0,
  totalCorrect: 0,
  totalQuestionsAttemptedOverall: 0,
  bestStreak: 0,
  totalOverallTimeSpent: 0,
  averageTimePerQuestionOverall: 0,
  challengeStats: {},
  results: [],
})

////////////////////////////
// Core API
////////////////////////////
export function getStatistics(): Statistics {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getEmptyStats()
    const data = JSON.parse(raw) as Statistics

    // guard against older saves that don’t have the newer props
    if (data.totalOverallTimeSpent === undefined) data.totalOverallTimeSpent = 0
    if (data.averageTimePerQuestionOverall === undefined) data.averageTimePerQuestionOverall = 0
    if (data.totalQuestionsAttemptedOverall === undefined) data.totalQuestionsAttemptedOverall = 0

    Object.values(data.challengeStats).forEach((c) => {
      if (c.totalTimeSpent === undefined) c.totalTimeSpent = 0
      if (c.totalQuestionsAttempted === undefined) c.totalQuestionsAttempted = 0
      if (c.averageTimePerQuestion === undefined) c.averageTimePerQuestion = 0
    })

    return data
  } catch (err) {
    console.error("Failed to parse statistics:", err)
    return getEmptyStats()
  }
}

export function saveGameResult(result: Omit<GameResult, "id" | "timestamp" | "accuracy">): boolean {
  try {
    const data = getStatistics()

    // Validate input
    if (result.score < 0 || result.totalQuestions <= 0 || result.score > result.totalQuestions) {
      console.error("Invalid game result data:", result)
      return false
    }

    const complete: GameResult = {
      ...result,
      id: generateId(),
      timestamp: Date.now(),
      accuracy: Math.min(100, Math.max(0, Math.round((result.score / result.totalQuestions) * 100))),
    }

    // persist recent results (max 1000)
    data.results.unshift(complete)
    if (data.results.length > 1000) data.results.length = 1000

    // overall stats
    data.totalGames += 1
    data.totalCorrect += complete.score
    data.totalQuestionsAttemptedOverall += complete.totalQuestions
    data.totalOverallTimeSpent += complete.timeSpent
    if (complete.streak && complete.streak > data.bestStreak) data.bestStreak = complete.streak
    data.averageTimePerQuestionOverall =
      data.totalQuestionsAttemptedOverall > 0
        ? Math.round(data.totalOverallTimeSpent / data.totalQuestionsAttemptedOverall)
        : 0

    // challenge stats
    if (!data.challengeStats[complete.challengeType]) {
      data.challengeStats[complete.challengeType] = {
        played: 0,
        accuracy: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        totalQuestionsAttempted: 0,
        averageTimePerQuestion: 0,
      }
    }

    const cs = data.challengeStats[complete.challengeType]
    cs.played += 1
    cs.totalTimeSpent += complete.timeSpent
    cs.totalQuestionsAttempted += complete.totalQuestions
    if (complete.score > cs.bestScore) cs.bestScore = complete.score

    // recompute accuracy & avg time/q for this challenge
    const relevant = data.results.filter((r) => r.challengeType === complete.challengeType)
    const correct = relevant.reduce((s, r) => s + r.score, 0)
    const qTotal = relevant.reduce((s, r) => s + r.totalQuestions, 0)
    cs.accuracy = qTotal ? Math.min(100, Math.max(0, Math.round((correct / qTotal) * 100))) : 0
    cs.averageTimePerQuestion = cs.totalQuestionsAttempted
      ? Math.round(cs.totalTimeSpent / cs.totalQuestionsAttempted)
      : 0

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (err) {
    console.error("saveGameResult failed:", err)
    return false
  }
}

export function clearAllData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (err) {
    console.error("clearAllData failed:", err)
    return false
  }
}

export function getResultsSortedBy(sort: "date" | "score" | "accuracy" = "date"): GameResult[] {
  const { results } = getStatistics()
  return [...results].sort((a, b) => {
    switch (sort) {
      case "score":
        return b.score - a.score
      case "accuracy":
        return b.accuracy - a.accuracy
      default:
        return b.timestamp - a.timestamp
    }
  })
}
