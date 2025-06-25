import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, Zap, Target, Brain, TrendingUp, Trophy } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function HomePage() {
  const challenges = [
    {
      id: "arithmetic",
      title: "Arithmetic",
      description: "Basic +, −, ×, ÷ operations",
      icon: Calculator,
      color: "bg-blue-500",
    },
    {
      id: "mental-math",
      title: "Mental Math",
      description: "Advanced calculations in your head",
      icon: Brain,
      color: "bg-purple-500",
    },
    {
      id: "speed-drill",
      title: "Speed Drill",
      description: "Rapid-fire math problems",
      icon: Zap,
      color: "bg-yellow-500",
    },
    {
      id: "number-sequences",
      title: "Number Sequences",
      description: "Find the missing number",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      id: "estimation",
      title: "Estimation",
      description: "Quick approximations",
      icon: Target,
      color: "bg-red-500",
    },
    {
      id: "mixed-challenge",
      title: "Mixed Challenge",
      description: "All types combined",
      icon: Brain,
      color: "bg-indigo-500",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
      <Navbar />

      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-black dark:text-white mb-4">Mathiks</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Choose your math challenge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full mb-8">
        {challenges.map((challenge) => {
          const IconComponent = challenge.icon
          return (
            <Link key={challenge.id} href={`/challenge/${challenge.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <div
                    className={`${challenge.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">{challenge.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{challenge.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="flex gap-4">
        <Link href="/results">
          <Button variant="outline" size="lg">
            <Trophy className="w-5 h-5 mr-2" />
            Results
          </Button>
        </Link>
        <Link href="/statistics">
          <Button variant="outline" size="lg">
            <TrendingUp className="w-5 h-5 mr-2" />
            Statistics
          </Button>
        </Link>
      </div>
    </div>
  )
}
