"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface CoinFlipProps {
  onComplete: () => void
  duration?: number
}

export function CoinFlip({ onComplete, duration = 3000 }: CoinFlipProps) {
  const [isFlipping, setIsFlipping] = useState(true)
  const [result, setResult] = useState<"heads" | "tails">("heads")

  useEffect(() => {
    if (isFlipping) {
      setTimeout(() => {
        setIsFlipping(false)
        setResult(Math.random() < 0.5 ? "heads" : "tails")
        setTimeout(onComplete, 1000) // Give time to see the final result
      }, duration)
    }
  }, [isFlipping, duration, onComplete])

  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-2xl font-bold mb-8">Flipping a coin...</h3>
      <div className="relative h-32 w-32">
        <motion.div
          className="absolute inset-0"
          animate={{
            rotateY: isFlipping ? [0, 1800] : result === "heads" ? 0 : 180,
            z: isFlipping ? [0, 100, 0] : 0,
          }}
          transition={{
            duration: duration / 1000,
            ease: "easeInOut",
          }}
        >
          {/* Heads side */}
          <div className="absolute inset-0 rounded-full bg-yellow-400 border-4 border-yellow-500 flex items-center justify-center backface-hidden">
            <div className="text-yellow-700 text-2xl font-bold">H</div>
          </div>

          {/* Tails side */}
          <div className="absolute inset-0 rounded-full bg-yellow-400 border-4 border-yellow-500 flex items-center justify-center backface-hidden rotate-y-180">
            <div className="text-yellow-700 text-2xl font-bold">T</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
