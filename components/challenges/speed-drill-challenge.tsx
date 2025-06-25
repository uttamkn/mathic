"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveGameResult } from "@/lib/statistics" // Updated import

interface Question {
  problem: string
  answer: number
}

export default function SpeedDrillChallenge() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "complete">("setup")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  const generateSimpleQuestion = useCallback((): Question => {
    const operations = [
      () => {
        const a = Math.floor(Math.random() * 20) + 1
        const b = Math.floor(Math.random() * 20) + 1
        return { problem: `${a} + ${b}`, answer: a + b }
      },
      () => {
        const a = Math.floor(Math.random() * 20) + 10
        const b = Math.floor(Math.random() * 10) + 1
        return { problem: `${a} − ${b}`, answer: a - b }
      },
      () => {
        const a = Math.floor(Math.random() * 12) + 1
        const b = Math.floor(Math.random() * 12) + 1
        return { problem: `${a} × ${b}`, answer: a * b }
      },
    ]

    const generator = operations[Math.floor(Math.random() * operations.length)]
    return generator()
  }, [])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setQuestionCount(0)
    setStreak(0)
    setBestStreak(0)
    setTimeLeft(60)
    setGameStartTime(Date.now())
    const question = generateSimpleQuestion()
    setCurrentQuestion(question)
    setUserAnswer("")
  }

  const submitAnswer = () => {
    if (!currentQuestion || userAnswer === "") return

    const isCorrect = Number.parseInt(userAnswer) === currentQuestion.answer

    if (isCorrect) {
      setScore(score + 1)
      setStreak(streak + 1)
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1)
      }
    } else {
      setStreak(0)
    }

    setQuestionCount(questionCount + 1)

    // Immediately generate next question
    const nextQuestion = generateSimpleQuestion()
    setCurrentQuestion(nextQuestion)
    setUserAnswer("")
  }

  const resetGame = () => {
    setGameState("setup")
    setCurrentQuestion(null)
    setUserAnswer("")
    setScore(0)
    setQuestionCount(0)
    setStreak(0)
    setBestStreak(0)
  }

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "playing" && timeLeft === 0) {
      // Save game result before completing
      const gameEndTime = Date.now()
      const timeSpent = Math.round((gameEndTime - gameStartTime) / 1000)

      const success = saveGameResult({
        challengeType: "speed-drill",
        challengeName: "Speed Drill",
        score,
        totalQuestions: questionCount,
        timeSpent,
        date: new Date().toISOString(),
        streak: bestStreak,
      })

      if (!success) {
        console.warn("Failed to save game result")
      }

      setGameState("complete")
    }
  }, [timeLeft, gameState, score, questionCount, bestStreak, gameStartTime]) // Added dependencies

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && gameState === "playing") {
      submitAnswer()
    }
  }

  if (gameState === "setup") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4">Speed Drill</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Answer as many as you can in 60 seconds!</p>
          <div className="text-lg text-gray-500 dark:text-gray-400 space-y-2">
            <p>• Simple addition, subtraction, multiplication</p>
            <p>• No time limit per question</p>
            <p>• Build your streak!</p>
          </div>
        </div>

        <Button onClick={startGame} className="h-16 px-12 text-xl font-bold">
          Start Speed Drill
        </Button>
      </div>
    )
  }

  if (gameState === "complete") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-8">Speed Drill Complete!</h1>
          <div className="space-y-4 mb-8">
            <div className="text-6xl font-bold text-yellow-500">{score}</div>
            <p className="text-2xl text-gray-600 dark:text-gray-400">Correct Answers</p>
            <div className="text-3xl font-bold text-orange-500">Best Streak: {bestStreak}</div>
            <p className="text-lg text-gray-500 dark:text-gray-400">Total Attempted: {questionCount}</p>
          </div>
          <Button onClick={resetGame} className="h-16 px-8 text-xl font-bold">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-8 text-lg font-medium text-black dark:text-white">
        <span>Score: {score}</span>
        <span>Streak: {streak}</span>
        <span className={timeLeft <= 10 ? "text-red-500 text-2xl font-bold" : ""}>Time: {timeLeft}s</span>
      </div>

      {/* Main Content */}
      <div className="text-center">
        {currentQuestion && (
          <>
            <div className="text-8xl font-bold text-black dark:text-white mb-12">{currentQuestion.problem} = ?</div>

            <div className="space-y-8">
              <Input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-4xl text-center h-20 w-80 mx-auto border-2 border-gray-300 focus:border-black dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white"
                placeholder="Answer"
                autoFocus
              />
              <Button onClick={submitAnswer} disabled={userAnswer === ""} className="h-16 px-12 text-xl font-bold">
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
