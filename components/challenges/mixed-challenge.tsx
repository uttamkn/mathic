"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveGameResult } from "@/lib/statistics"

type Question = {
  problem: string
  answer: number
  type: string
  hint?: string
}

const MixedChallenge: React.FC = () => {
  const [gameState, setGameState] = useState<"setup" | "playing" | "feedback" | "complete">("setup")
  const [totalQuestions, setTotalQuestions] = useState<number>(25)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(35)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  useEffect(() => {
    if (gameState === "complete") {
      // Save game result
    }
  }, [gameState])

  const mixedProblems = useCallback(
    () => [
      // Basic arithmetic
      () => {
        const a = Math.floor(Math.random() * 50) + 10
        const b = Math.floor(Math.random() * 30) + 5
        const ops = [
          { symbol: "+", calc: (x: number, y: number) => x + y },
          { symbol: "−", calc: (x: number, y: number) => x - y },
          { symbol: "×", calc: (x: number, y: number) => x * y },
        ]
        const op = ops[Math.floor(Math.random() * ops.length)]
        return {
          problem: `${a} ${op.symbol} ${b}`,
          answer: op.calc(a, b),
          type: "Arithmetic",
        }
      },
      // Mental math
      () => {
        const num = Math.floor(Math.random() * 15) + 10
        return {
          problem: `${num}²`,
          answer: num * num,
          type: "Mental Math",
          hint: "Perfect square",
        }
      },
      // Percentage
      () => {
        const base = [25, 50, 75, 100, 150, 200][Math.floor(Math.random() * 6)]
        const percent = [10, 20, 25, 30, 50][Math.floor(Math.random() * 5)]
        return {
          problem: `${percent}% of ${base}`,
          answer: (base * percent) / 100,
          type: "Percentage",
        }
      },
      // Number sequence
      () => {
        const start = Math.floor(Math.random() * 10) + 1
        const diff = Math.floor(Math.random() * 8) + 2
        const sequence = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff]
        return {
          problem: `${sequence[0]}, ${sequence[1]}, ?, ${sequence[3]}, ${sequence[4]}`,
          answer: sequence[2],
          type: "Sequence",
        }
      },
      // Quick division
      () => {
        const divisor = Math.floor(Math.random() * 12) + 2
        const quotient = Math.floor(Math.random() * 20) + 5
        const dividend = divisor * quotient
        return {
          problem: `${dividend} ÷ ${divisor}`,
          answer: quotient,
          type: "Division",
        }
      },
    ],
    [],
  )

  const generateQuestion = useCallback((): Question => {
    const problems = mixedProblems()
    const generator = problems[Math.floor(Math.random() * problems.length)]
    return generator()
  }, [mixedProblems])

  const nextQuestion = useCallback(() => {
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserAnswer("")
    setFeedback(null)
    setTimeLeft(35)
    setGameState("playing")
  }, [generateQuestion])

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || userAnswer === "") return

    const isCorrect = Number.parseInt(userAnswer) === currentQuestion.answer
    const newScore = isCorrect ? score + 1 : score
    const newQuestionCount = questionCount + 1

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? "Correct!" : `Wrong! Answer: ${currentQuestion.answer}`,
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
          challengeType: "mixed-challenge",
          challengeName: "Mixed Challenge",
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
    }, 1500)
  }, [currentQuestion, userAnswer, score, questionCount, totalQuestions, gameStartTime, nextQuestion])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setQuestionCount(0)
    setTimeLeft(35)
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
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4">Mixed Challenge</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            All challenge types combined - the ultimate test!
          </p>
          <div className="text-lg text-gray-500 dark:text-gray-400 space-y-2">
            <p>• Arithmetic operations</p>
            <p>• Mental math calculations</p>
            <p>• Percentage problems</p>
            <p>• Number sequences</p>
            <p>• 35 seconds per question</p>
          </div>
        </div>

        <div className="space-y-6 w-full max-w-md">
          <Select value={totalQuestions.toString()} onValueChange={(value) => setTotalQuestions(Number(value))}>
            <SelectTrigger className="h-12 text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
              <SelectItem value="25">25 Questions</SelectItem>
              <SelectItem value="30">30 Questions</SelectItem>
              <SelectItem value="40">40 Questions</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={startGame} className="w-full h-16 text-xl font-bold">
            Start Mixed Challenge
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "complete") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-8">Mixed Challenge Complete!</h1>
          <div className="text-6xl font-bold text-indigo-500 mb-4">
            {score}/{totalQuestions}
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
            Overall Math Score: {Math.round((score / totalQuestions) * 100)}%
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
        <span className={timeLeft <= 10 ? "text-red-500" : ""}>Time: {timeLeft}s</span>
      </div>

      {/* Challenge Type Badge */}
      {currentQuestion && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium dark:bg-gray-800 dark:text-gray-300">
            {currentQuestion.type}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="text-center">
        {currentQuestion && (
          <>
            <div className="text-7xl font-bold text-black dark:text-white mb-8">{currentQuestion.problem} = ?</div>
            {currentQuestion.hint && (
              <div className="text-xl text-gray-500 dark:text-gray-400 mb-8">{currentQuestion.hint}</div>
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

export default MixedChallenge
