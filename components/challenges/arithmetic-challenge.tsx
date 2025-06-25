"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveGameResult } from "@/lib/statistics" // Updated import

type Operation = "addition" | "subtraction" | "multiplication" | "division"
type Difficulty = "2-digit" | "3-digit" | "mixed"

interface Question {
  num1: number
  num2: number
  operation: Operation
  answer: number
  display: string
}

export default function ArithmeticChallenge() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "feedback" | "complete">("setup")
  const [operation, setOperation] = useState<Operation>("addition")
  const [difficulty, setDifficulty] = useState<Difficulty>("2-digit")
  const [totalQuestions, setTotalQuestions] = useState<number>(20)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  const getNumberRange = (diff: Difficulty) => {
    switch (diff) {
      case "2-digit":
        return { min: 10, max: 99 }
      case "3-digit":
        return { min: 100, max: 999 }
      case "mixed":
        return { min: 10, max: 999 }
    }
  }

  const generateQuestion = useCallback((): Question => {
    const range = getNumberRange(difficulty)
    let num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    let num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

    let answer: number
    let display: string

    switch (operation) {
      case "addition":
        answer = num1 + num2
        display = `${num1} + ${num2}`
        break
      case "subtraction":
        if (num2 > num1) [num1, num2] = [num2, num1] // Ensure positive result
        answer = num1 - num2
        display = `${num1} − ${num2}`
        break
      case "multiplication":
        // Keep numbers smaller for multiplication
        num1 = Math.floor(Math.random() * 50) + 10
        num2 = Math.floor(Math.random() * 20) + 2
        answer = num1 * num2
        display = `${num1} × ${num2}`
        break
      case "division":
        // Ensure clean division
        num2 = Math.floor(Math.random() * 20) + 2
        answer = Math.floor(Math.random() * 50) + 10
        num1 = answer * num2
        display = `${num1} ÷ ${num2}`
        break
    }

    return { num1, num2, operation, answer, display }
  }, [operation, difficulty])

  const nextQuestion = useCallback(() => {
    const question = generateQuestion()
    setCurrentQuestion(question)
    setUserAnswer("")
    setFeedback(null)
    setTimeLeft(30)
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
        // Save game result before completing
        const gameEndTime = Date.now()
        const timeSpent = Math.round((gameEndTime - gameStartTime) / 1000)

        const success = saveGameResult({
          challengeType: "arithmetic",
          challengeName: "Arithmetic Challenge",
          difficulty: difficulty,
          operation: operation,
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
  }, [
    currentQuestion,
    userAnswer,
    score,
    questionCount,
    totalQuestions,
    difficulty,
    operation,
    gameStartTime,
    nextQuestion,
  ])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setQuestionCount(0)
    setTimeLeft(30)
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

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && gameState === "playing") {
      submitAnswer()
    }
  }

  if (gameState === "setup") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4">Arithmetic Challenge</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Choose your settings</p>
        </div>

        <div className="space-y-8 w-full max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={operation === "addition" ? "default" : "outline"}
              onClick={() => setOperation("addition")}
              className="h-16 text-lg"
            >
              Addition
            </Button>
            <Button
              variant={operation === "subtraction" ? "default" : "outline"}
              onClick={() => setOperation("subtraction")}
              className="h-16 text-lg"
            >
              Subtraction
            </Button>
            <Button
              variant={operation === "multiplication" ? "default" : "outline"}
              onClick={() => setOperation("multiplication")}
              className="h-16 text-lg"
            >
              Multiplication
            </Button>
            <Button
              variant={operation === "division" ? "default" : "outline"}
              onClick={() => setOperation("division")}
              className="h-16 text-lg"
            >
              Division
            </Button>
          </div>

          <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)}>
            <SelectTrigger className="h-12 text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectItem value="2-digit">2-Digit Numbers</SelectItem>
              <SelectItem value="3-digit">3-Digit Numbers</SelectItem>
              <SelectItem value="mixed">Mixed Difficulty</SelectItem>
            </SelectContent>
          </Select>

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
              <SelectItem value="30">30 Questions</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={startGame} className="w-full h-16 text-xl font-bold">
            Start Practice
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "complete") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-8">Challenge Complete!</h1>
          <div className="text-6xl font-bold text-blue-500 mb-4">
            {score}/{totalQuestions}
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
            Accuracy: {Math.round((score / totalQuestions) * 100)}%
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
            <div className="text-8xl font-bold text-black dark:text-white mb-12">{currentQuestion.display} = ?</div>

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
