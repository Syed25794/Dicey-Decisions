"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface DiceRollProps {
  onComplete: () => void
  duration?: number
}

export function DiceRoll({ onComplete, duration = 3000 }: DiceRollProps) {
  const [currentFace, setCurrentFace] = useState(1)
  const [isRolling, setIsRolling] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRolling) {
      interval = setInterval(() => {
        setCurrentFace(Math.floor(Math.random() * 6) + 1)
      }, 100)

      setTimeout(() => {
        setIsRolling(false)
        clearInterval(interval)
        setTimeout(onComplete, 1000) // Give time to see the final result
      }, duration)
    }

    return () => clearInterval(interval)
  }, [isRolling, duration, onComplete])

  const renderDots = (face: number) => {
    switch (face) {
      case 1:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </div>
        )
      case 2:
        return (
          <div className="absolute inset-0 grid grid-cols-2 p-4">
            <div className="flex items-start justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-end justify-end">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-4">
            <div className="flex items-start justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="col-start-2 row-start-2 flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="col-start-3 row-start-3 flex items-end justify-end">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-4">
            <div className="flex items-start justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-start justify-end">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-end justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-end justify-end">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-4">
            <div className="flex items-start justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-start justify-end col-start-3">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="col-start-2 row-start-2 flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="row-start-3 flex items-end justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="col-start-3 row-start-3 flex items-end justify-end">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 p-4">
            <div className="flex items-start justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-start justify-end">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-center justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-center justify-end">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-end justify-start">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-end justify-end">
              <div className="w-4 h-4 bg-black rounded-full"></div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-2xl font-bold mb-8">Rolling the dice...</h3>
      <motion.div
        className="w-24 h-24 bg-white rounded-lg shadow-lg relative"
        animate={{
          rotateX: isRolling ? [0, 360, 720, 1080, 1440] : 0,
          rotateY: isRolling ? [0, 360, 720, 1080, 1440] : 0,
          rotateZ: isRolling ? [0, 360, 720, 1080, 1440] : 0,
        }}
        transition={{
          duration: duration / 1000,
          ease: "easeInOut",
        }}
      >
        {renderDots(currentFace)}
      </motion.div>
    </div>
  )
}
