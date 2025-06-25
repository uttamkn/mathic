"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveGameResult } from "@/lib/statistics" // Updated import

interface Question {
  problem: string
  answer: number
  hint?: string
}

export default function MentalMathChallenge() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "feedback" | "complete">("setup")
  const [totalQuestions, setTotalQuestions] = useState<number>(15)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  const mentalMathProblems = useCallback(
    () => [
      // Squares
      () => {
        const num = Math.floor(Math.random() * 20) + 10
        return { problem: `${num}²`, answer: num * num, hint: "Perfect square" }
      },
      // Double and add
      () => {
        const num = Math.floor(Math.random() * 50) + 25
        return { problem: `${num} × 2 + 15`, answer: num * 2 + 15, hint: "Double then add" }
      },
      // Percentage calculations
      () => {
        const base = [25, 50, 75, 100, 125, 150, 200][Math.floor(Math.random() * 7)]
        const percent = [10, 20, 25, 30, 40, 50][Math.floor(Math.random() * 6)]
        return { problem: `${percent}% of ${base}`, answer: (base * percent) / 100, hint: "Percentage" }
      },
      // Quick multiplication tricks
      () => {
        const num = Math.floor(Math.random() * 90) + 10
        return { problem: `${num} × 11`, answer: num * 11, hint: "Multiply by 11 trick" }
      },
      // Sum of consecutive numbers
      () => {
        const start = Math.floor(Math.random() * 10) + 1
        const count = 5
        const sum = (count * (2 * start + count - 1)) / 2
        return {
          problem: `${start} + ${start + 1} + ${start + 2} + ${start + 3} + ${start + 4}`,
          answer: sum,
          hint: "Consecutive sum",
        }
      },
    ],
    [],
  )

  const generateQuestion = useCallback((): Question => {
    const problems = mentalMathProblems()
    const generator = problems[Math.floor(Math.random() * problems.length)]
    return generator()
  }, [mentalMathProblems])

  const nextQuestion = useCallback(() => {
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserAnswer("")
    setFeedback(null)
    setTimeLeft(45)
    setGameState("playing")
  }, [generateQuestion])

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || userAnswer === "") return

    const isCorrect = Number.parseInt(userAnswer) === currentQuestion.answer
    const newScore = isCorrect ? score + 1 : score
    const newQuestionCount = questionCount + 1

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? "Excellent!" : `Not quite! Answer: ${currentQuestion.answer}`,
    })

    if (isCorrect) setScore(newScore)
    setQuestionCount(newQuestionCount)
    setGameState("feedback")

    setTimeout(() => {
      if (newQuestionCount >= totalQuestions) {
        // Save game result
        const gameEndTime = Date.now()
        const timeSpent = Math.round((gameEndTime - gameStartTime) / 1000)

        const success = saveGameResult({
          challengeType: "mental-math",
          challengeName: "Mental Math Challenge",
          score: newScore,
          totalQuestions,
          timeSpent,
          date: new Date().toISOString(),
        })

        if (!success) {
          console.warn("Failed to save game result")
        }

        setGameState("complete")
      } else {
        nextQuestion()
      }
    }, 2000)
  }, [currentQuestion, userAnswer, score, questionCount, totalQuestions, gameStartTime, nextQuestion])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setQuestionCount(0)
    setTimeLeft(45)
    setGameStartTime(Date.now())
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserAnswer("")
    setFeedback(null)
  }

  const resetGame = () => {
    setGameState("setup")
    setCurrentQuestion(null)
    setUserAnswer("")
    setScore(0)
    setQuestionCount(0)
    setFeedback(null)
  }

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "playing" && timeLeft === 0) {
      submitAnswer()
    }
  }, [timeLeft, gameState, submitAnswer])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && gameState === "playing") {
      submitAnswer()
    }
  }

  if (gameState === "setup") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4">Mental Math Challenge</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Advanced calculations without writing</p>
          <div className="text-lg text-gray-500 dark:text-gray-400 space-y-2">
            <p>• Squares and powers</p>
            <p>• Percentage calculations</p>
            <p>• Quick multiplication tricks</p>
            <p>• 45 seconds per question</p>
          </div>
        </div>

        <div className="space-y-6 w-full max-w-md">
          <Select value={totalQuestions.toString()} onValueChange={(value) => setTotalQuestions(Number(value))}>
            <SelectTrigger className="h-12 text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
              <SelectItem value="25">25 Questions</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={startGame} className="w-full h-16 text-xl font-bold">
            Start Mental Math
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "complete") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-8">Mental Math Complete!</h1>
          <div className="text-6xl font-bold text-purple-500 mb-4">
            {score}/{totalQuestions}
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
            Mental Math Score: {Math.round((score / totalQuestions) * 100)}%
          </p>
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
        <span>
          Q{questionCount + 1}/{totalQuestions}
        </span>
        <span>Score: {score}</span>
        <span className={timeLeft <= 15 ? "text-red-500" : ""}>Time: {timeLeft}s</span>
      </div>

      {/* Main Content */}
      <div className="text-center">
        {currentQuestion && (
          <>
            <div className="text-7xl font-bold text-black dark:text-white mb-8">{currentQuestion.problem} = ?</div>
            {currentQuestion.hint && (
              <div className="text-xl text-gray-500 dark:text-gray-400 mb-12">{currentQuestion.hint}</div>
            )}

            {gameState === "playing" && (
              <div className="space-y-8">
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-4xl text-center h-20 w-80 mx-auto border-2 border-gray-300 focus:border-black dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white"
                  placeholder="Your answer"
                  autoFocus
                />
                <Button onClick={submitAnswer} disabled={userAnswer === ""} className="h-16 px-12 text-xl font-bold">
                  Submit
                </Button>
              </div>
            )}

            {gameState === "feedback" && feedback && (
              <div className={`text-4xl font-bold ${feedback.correct ? "text-green-500" : "text-red-500"}`}>
                {feedback.message}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
