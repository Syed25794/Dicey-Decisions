"use client"

import { useState } from "react"
import { DiceRoll } from "./dice-roll"
import { CoinFlip } from "./coin-flip"
import { Spinner } from "./spinner"
import { Button } from "../ui/button"

interface TiebreakerProps {
  type: "dice" | "coin" | "spinner"
  onComplete: () => void
}

export function Tiebreaker({ type, onComplete }: TiebreakerProps) {
  const [isStarted, setIsStarted] = useState(false)

  const handleStart = () => {
    setIsStarted(true)
  }

  const renderTiebreaker = () => {
    switch (type) {
      case "dice":
        return <DiceRoll onComplete={onComplete} />
      case "coin":
        return <CoinFlip onComplete={onComplete} />
      case "spinner":
        return <Spinner onComplete={onComplete} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg">
      {!isStarted ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">It's a tie!</h2>
          <p className="text-white mb-8">
            {type === "dice" && "Let's roll the dice to break the tie!"}
            {type === "coin" && "Let's flip a coin to break the tie!"}
            {type === "spinner" && "Let's spin the wheel to break the tie!"}
          </p>
          <Button onClick={handleStart} size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
            {type === "dice" && "Roll the Dice"}
            {type === "coin" && "Flip the Coin"}
            {type === "spinner" && "Spin the Wheel"}
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-inner">{renderTiebreaker()}</div>
      )}
    </div>
  )
}
