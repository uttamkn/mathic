"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveGameResult } from "@/lib/statistics" // Updated import

interface Question {
  problem: string
  exactAnswer: number
  acceptableRange: { min: number; max: number }
  hint: string
}

export default function EstimationChallenge() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "feedback" | "complete">("setup")
  const [totalQuestions, setTotalQuestions] = useState<number>(10)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  const estimationProblems = useCallback(
    () => [
      // Large multiplication
      () => {
        const a = Math.floor(Math.random() * 50) + 150
        const b = Math.floor(Math.random() * 30) + 20
        const exact = a * b
        const tolerance = Math.floor(exact * 0.15) // 15% tolerance
        return {
          problem: `${a} × ${b}`,
          exactAnswer: exact,
          acceptableRange: { min: exact - tolerance, max: exact + tolerance },
          hint: "Round to nearest hundreds",
        }
      },
      // Percentage of large numbers
      () => {
        const base = Math.floor(Math.random() * 500) + 200
        const percent = [15, 25, 35, 45, 65, 75, 85][Math.floor(Math.random() * 7)]
        const exact = Math.floor((base * percent) / 100)
        const tolerance = Math.floor(exact * 0.1) // 10% tolerance
        return {
          problem: `${percent}% of ${base}`,
          exactAnswer: exact,
          acceptableRange: { min: exact - tolerance, max: exact + tolerance },
          hint: "Estimate percentage",
        }
      },
      // Division with remainders
      () => {
        const dividend = Math.floor(Math.random() * 800) + 200
        const divisor = Math.floor(Math.random() * 20) + 10
        const exact = Math.floor(dividend / divisor)
        const tolerance = 2
        return {
          problem: `${dividend} ÷ ${divisor}`,
          exactAnswer: exact,
          acceptableRange: { min: exact - tolerance, max: exact + tolerance },
          hint: "Ignore remainder",
        }
      },
      // Square roots
      () => {
        const perfect = Math.floor(Math.random() * 15) + 10
        const number = perfect * perfect + Math.floor(Math.random() * 20) - 10
        const exact = Math.sqrt(number)
        const tolerance = 1
        return {
          problem: `√${number}`,
          exactAnswer: Math.floor(exact),
          acceptableRange: { min: Math.floor(exact) - tolerance, max: Math.floor(exact) + tolerance },
          hint: "Nearest whole number",
        }
      },
    ],
    [],
  )

  const generateQuestion = useCallback((): Question => {
    const problems = estimationProblems()
    const generator = problems[Math.floor(Math.random() * problems.length)]
    return generator()
  }, [estimationProblems])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setQuestionCount(0)
    setTimeLeft(20)
    setGameStartTime(Date.now())
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserAnswer("")
    setFeedback(null)
  }

  const submitAnswer = () => {
    if (!currentQuestion || userAnswer === "") return

    const userNum = Number.parseInt(userAnswer)
    const isCorrect = userNum >= currentQuestion.acceptableRange.min && userNum <= currentQuestion.acceptableRange.max
    const newScore = isCorrect ? score + 1 : score
    const newQuestionCount = questionCount + 1

    setFeedback({
      correct: isCorrect,
      message: isCorrect
        ? `Great estimate! (Exact: ${currentQuestion.exactAnswer})`
        : `Not quite! Range: ${currentQuestion.acceptableRange.min}-${currentQuestion.acceptableRange.max}`,
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
          challengeType: "estimation",
          challengeName: "Estimation Challenge",
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
    }, 2500)
  }

  const nextQuestion = useCallback(() => {
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserAnswer("")
    setFeedback(null)
    setTimeLeft(20)
    setGameState("playing")
  }, [generateQuestion])

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
      setGameState("feedback")
      setFeedback({
        correct: false,
        message: `Time's up! Range: ${currentQuestion?.acceptableRange.min}-${currentQuestion?.acceptableRange.max}`,
      })
      setTimeout(() => {
        const newQuestionCount = questionCount + 1
        if (newQuestionCount >= totalQuestions) {
          // Save game result
          const gameEndTime = Date.now()
          const timeSpent = Math.round((gameEndTime - gameStartTime) / 1000)

          const success = saveGameResult({
            challengeType: "estimation",
            challengeName: "Estimation Challenge",
            score,
            totalQuestions,
            timeSpent,
            date: new Date().toISOString(),
          })

          if (!success) {
            console.warn("Failed to save game result")
          }

          setGameState("complete")
        } else {
          setQuestionCount(newQuestionCount)
          nextQuestion()
        }
      }, 2500)
    }
  }, [timeLeft, gameState, currentQuestion, questionCount, totalQuestions, score, gameStartTime, nextQuestion])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && gameState === "playing") {
      submitAnswer()
    }
  }

  if (gameState === "setup") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4">Estimation Challenge</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Quick approximations - get close to the answer!
          </p>
          <div className="text-lg text-gray-500 dark:text-gray-400 space-y-2">
            <p>• Large number calculations</p>
            <p>• Percentage estimates</p>
            <p>• Square root approximations</p>
            <p>• 20 seconds per question</p>
          </div>
        </div>

        <div className="space-y-6 w-full max-w-md">
          <Select value={totalQuestions.toString()} onValueChange={(value) => setTotalQuestions(Number(value))}>
            <SelectTrigger className="h-12 text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="8">8 Questions</SelectItem>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={startGame} className="w-full h-16 text-xl font-bold">
            Start Estimation
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "complete") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-8">Estimation Complete!</h1>
          <div className="text-6xl font-bold text-red-500 mb-4">
            {score}/{totalQuestions}
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
            Estimation Skills: {Math.round((score / totalQuestions) * 100)}%
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
        <span className={timeLeft <= 5 ? "text-red-500" : ""}>Time: {timeLeft}s</span>
      </div>

      {/* Main Content */}
      <div className="text-center">
        {currentQuestion && (
          <>
            <div className="text-2xl text-gray-600 dark:text-gray-400 mb-4">Estimate:</div>
            <div className="text-7xl font-bold text-black dark:text-white mb-8">{currentQuestion.problem} ≈ ?</div>
            <div className="text-lg text-gray-500 dark:text-gray-400 mb-12">{currentQuestion.hint}</div>

            {gameState === "playing" && (
              <div className="space-y-8">
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-4xl text-center h-20 w-80 mx-auto border-2 border-gray-300 focus:border-black dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white"
                  placeholder="Your estimate"
                  autoFocus
                />
                <Button onClick={submitAnswer} disabled={userAnswer === ""} className="h-16 px-12 text-xl font-bold">
                  Submit
                </Button>
              </div>
            )}

            {gameState === "feedback" && feedback && (
              <div className={`text-3xl font-bold ${feedback.correct ? "text-green-500" : "text-red-500"}`}>
                {feedback.message}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
