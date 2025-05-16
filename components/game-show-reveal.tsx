"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Confetti } from "@/components/ui/confetti"

interface GameShowRevealProps {
  winningOption: string
  tiebreaker?: "dice" | "spinner" | "coin"
}

export function GameShowReveal({ winningOption, tiebreaker }: GameShowRevealProps) {
  const [stage, setStage] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Stage 0: Initial
    // Stage 1: Drumroll
    // Stage 2: Reveal
    const timer1 = setTimeout(() => setStage(1), 500)
    const timer2 = setTimeout(() => {
      setStage(2)
      setShowConfetti(true)
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="relative">
      {showConfetti && <Confetti />}

      <div className="p-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg text-white text-center overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="stage0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-2">And the winner is...</h3>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="py-8"
            >
              <h3 className="text-3xl font-bold mb-6">Drumroll please...</h3>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 bg-white rounded-full"
                    animate={{
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <motion.h3
                className="text-3xl font-bold mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, times: [0, 0.5, 1] }}
              >
                Decision Made!
              </motion.h3>

              <p className="text-xl mb-6">The winning option is:</p>

              <motion.div
                className="text-4xl font-bold mb-6 px-6 py-4 bg-white/20 rounded-lg inline-block"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {winningOption}
              </motion.div>

              {tiebreaker && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  Decided by{" "}
                  <span className="font-bold">
                    {tiebreaker === "dice" ? "🎲 dice roll" : tiebreaker === "spinner" ? "🎡 spinner" : "🪙 coin flip"}
                  </span>
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
