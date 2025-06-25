"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveGameResult } from "@/lib/statistics" // Updated import

interface Question {
  sequence: number[]
  missing: number
  answer: number
  pattern: string
}

export default function NumberSequenceChallenge() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "feedback" | "complete">("setup")
  const [totalQuestions, setTotalQuestions] = useState<number>(12)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState<string>("")
  const [score, setScore] = useState<number>(0)
  const [questionCount, setQuestionCount] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(40)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  const sequenceGenerators = useCallback(
    () => [
      // Arithmetic sequence
      () => {
        const start = Math.floor(Math.random() * 20) + 1
        const diff = Math.floor(Math.random() * 10) + 2
        const sequence = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff]
        const missing = Math.floor(Math.random() * 5)
        const answer = sequence[missing]
        sequence[missing] = -1 // Mark as missing
        return { sequence, missing, answer, pattern: `+${diff}` }
      },
      // Geometric sequence
      () => {
        const start = Math.floor(Math.random() * 5) + 2
        const ratio = Math.floor(Math.random() * 3) + 2
        const sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio]
        const missing = Math.floor(Math.random() * 4)
        const answer = sequence[missing]
        sequence[missing] = -1
        return { sequence, missing, answer, pattern: `×${ratio}` }
      },
      // Fibonacci-like
      () => {
        const a = Math.floor(Math.random() * 5) + 1
        const b = Math.floor(Math.random() * 5) + 1
        const sequence = [a, b, a + b, a + 2 * b, 2 * a + 3 * b]
        const missing = Math.floor(Math.random() * 5)
        const answer = sequence[missing]
        sequence[missing] = -1
        return { sequence, missing, answer, pattern: "Fibonacci-like" }
      },
      // Squares
      () => {
        const start = Math.floor(Math.random() * 5) + 1
        const sequence = [
          start * start,
          (start + 1) * (start + 1),
          (start + 2) * (start + 2),
          (start + 3) * (start + 3),
        ]
        const missing = Math.floor(Math.random() * 4)
        const answer = sequence[missing]
        sequence[missing] = -1
        return { sequence, missing, answer, pattern: "Perfect squares" }
      },
    ],
    [],
  )

  const generateQuestion = useCallback((): Question => {
    const generators = sequenceGenerators()
    const generator = generators[Math.floor(Math.random() * generators.length)]
    return generator()
  }, [sequenceGenerators])

  const nextQuestion = useCallback(() => {
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserAnswer("")
    setFeedback(null)
    setTimeLeft(40)
    setGameState("playing")
  }, [generateQuestion])

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || userAnswer === "") return

    const isCorrect = Number.parseInt(userAnswer) === currentQuestion.answer
    const newScore = isCorrect ? score + 1 : score
    const newQuestionCount = questionCount + 1

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? "Perfect!" : `Not quite! Answer: ${currentQuestion.answer}`,
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
          challengeType: "number-sequences",
          challengeName: "Number Sequences",
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
    setTimeLeft(40)
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
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4">Number Sequences</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Find the missing number in the pattern</p>
          <div className="text-lg text-gray-500 dark:text-gray-400 space-y-2">
            <p>• Arithmetic sequences</p>
            <p>• Geometric sequences</p>
            <p>• Fibonacci patterns</p>
            <p>• Perfect squares</p>
          </div>
        </div>

        <div className="space-y-6 w-full max-w-md">
          <Select value={totalQuestions.toString()} onValueChange={(value) => setTotalQuestions(Number(value))}>
            <SelectTrigger className="h-12 text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white">
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="8">8 Questions</SelectItem>
              <SelectItem value="12">12 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={startGame} className="w-full h-16 text-xl font-bold">
            Start Sequences
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "complete") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-8">Sequences Complete!</h1>
          <div className="text-6xl font-bold text-green-500 mb-4">
            {score}/{totalQuestions}
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
            Pattern Recognition: {Math.round((score / totalQuestions) * 100)}%
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

      {/* Main Content */}
      <div className="text-center">
        {currentQuestion && (
          <>
            <div className="text-2xl text-gray-600 dark:text-gray-400 mb-8">Find the missing number:</div>
            <div className="text-6xl font-bold text-black dark:text-white mb-8 space-x-4">
              {currentQuestion.sequence.map((num, index) => (
                <span key={index} className={num === -1 ? "text-blue-500" : ""}>
                  {num === -1 ? "?" : num}
                  {index < currentQuestion.sequence.length - 1 && ", "}
                </span>
              ))}
            </div>
            <div className="text-lg text-gray-500 dark:text-gray-400 mb-12">Pattern: {currentQuestion.pattern}</div>

            {gameState === "playing" && (
              <div className="space-y-8">
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-4xl text-center h-20 w-80 mx-auto border-2 border-gray-300 focus:border-black dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white"
                  placeholder="Missing number"
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
