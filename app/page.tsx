import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">DiceyDecisions</h1>
          <p className="text-white/80 mt-2">Gamified Decision Making for Groups</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Make Group Decisions Fun!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Stop wasting time deciding where to eat, what movie to watch, or who does the dishes. DiceyDecisions makes
              group decision-making fun with voting, randomness, and game-show style reveals!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Log In
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4 text-purple-500">🎲</div>
              <h3 className="text-xl font-bold mb-2">Create Decision Rooms</h3>
              <p className="text-gray-600">
                Set up a room for any decision, invite your friends, and let everyone submit their ideas.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4 text-purple-500">🗳️</div>
              <h3 className="text-xl font-bold mb-2">Vote Anonymously</h3>
              <p className="text-gray-600">
                Everyone votes secretly, so there's no peer pressure or bias in the decision-making process.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4 text-purple-500">🎡</div>
              <h3 className="text-xl font-bold mb-2">Break Ties with Style</h3>
              <p className="text-gray-600">
                If there's a tie, break it with a dice roll, coin flip, or spinner wheel animation!
              </p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to make decisions more fun?</h2>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              >
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} DiceyDecisions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
