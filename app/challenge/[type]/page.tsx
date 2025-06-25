"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ArithmeticChallenge from "@/components/challenges/arithmetic-challenge"
import MentalMathChallenge from "@/components/challenges/mental-math-challenge"
import SpeedDrillChallenge from "@/components/challenges/speed-drill-challenge"
import NumberSequenceChallenge from "@/components/challenges/number-sequence-challenge"
import EstimationChallenge from "@/components/challenges/estimation-challenge"
import MixedChallenge from "@/components/challenges/mixed-challenge"
import { Navbar } from "@/components/navbar"

export default function ChallengePage() {
  const params = useParams()
  const challengeType = params.type as string

  const getChallengeComponent = () => {
    switch (challengeType) {
      case "arithmetic":
        return <ArithmeticChallenge />
      case "mental-math":
        return <MentalMathChallenge />
      case "speed-drill":
        return <SpeedDrillChallenge />
      case "number-sequences":
        return <NumberSequenceChallenge />
      case "estimation":
        return <EstimationChallenge />
      case "mixed-challenge":
        return <MixedChallenge />
      default:
        return <div>Challenge not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>
      {getChallengeComponent()}
    </div>
  )
}
