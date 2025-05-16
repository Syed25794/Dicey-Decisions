"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface SpinnerProps {
  onComplete: () => void
  duration?: number
}

export function Spinner({ onComplete, duration = 3000 }: SpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(true)
  const [rotation, setRotation] = useState(0)
  const spinnerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSpinning) {
      // Random number of rotations between 5 and 10
      const rotations = 5 + Math.floor(Math.random() * 5)
      const finalRotation = rotations * 360 + Math.floor(Math.random() * 360)

      setRotation(finalRotation)

      setTimeout(() => {
        setIsSpinning(false)
        setTimeout(onComplete, 1000) // Give time to see where it landed
      }, duration)
    }
  }, [isSpinning, duration, onComplete])

  // Generate 6 segments with different colors
  const segments = [
    { color: "bg-red-500", label: "1" },
    { color: "bg-blue-500", label: "2" },
    { color: "bg-green-500", label: "3" },
    { color: "bg-yellow-500", label: "4" },
    { color: "bg-purple-500", label: "5" },
    { color: "bg-pink-500", label: "6" },
  ]

  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-2xl font-bold mb-8">Spinning the wheel...</h3>
      <div className="relative w-64 h-64">
        <motion.div
          ref={spinnerRef}
          className="w-full h-full rounded-full overflow-hidden relative"
          animate={{ rotate: rotation }}
          transition={{
            duration: duration / 1000,
            ease: "easeOut",
          }}
        >
          {segments.map((segment, index) => {
            const rotate = index * (360 / segments.length)
            const skew = 90 - 360 / segments.length

            return (
              <div
                key={index}
                className={`absolute top-0 right-0 w-1/2 h-1/2 origin-top-left ${segment.color}`}
                style={{
                  transform: `rotate(${rotate}deg) skew(${skew}deg)`,
                  transformOrigin: "bottom left",
                }}
              >
                <div
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold"
                  style={{ transform: `skew(${-skew}deg) rotate(${45}deg)` }}
                >
                  {segment.label}
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-4 h-8 bg-white border-2 border-gray-800 z-10 transform rotate-180"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
      </div>
    </div>
  )
}
