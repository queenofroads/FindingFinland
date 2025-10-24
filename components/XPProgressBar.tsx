'use client'

import { Profile } from '@/types/database'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface XPProgressBarProps {
  profile: Profile
  recentXPGain?: number
}

export default function XPProgressBar({ profile, recentXPGain }: XPProgressBarProps) {
  const [showXPGain, setShowXPGain] = useState(false)
  const [animatedXP, setAnimatedXP] = useState(profile.total_xp)

  // Calculate XP needed for next level
  // Formula: Level = floor(sqrt(XP / 100)) + 1
  // So XP for level N = (N-1)^2 * 100
  const currentLevel = profile.level
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100
  const xpInCurrentLevel = profile.total_xp - xpForCurrentLevel
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel
  const progressPercent = (xpInCurrentLevel / xpNeededForLevel) * 100

  // Show XP gain animation
  useEffect(() => {
    if (recentXPGain && recentXPGain > 0) {
      setShowXPGain(true)
      const timer = setTimeout(() => setShowXPGain(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [recentXPGain])

  // Animate XP counter
  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = (profile.total_xp - animatedXP) / steps
    let current = animatedXP

    const timer = setInterval(() => {
      current += increment
      if (increment > 0 && current >= profile.total_xp) {
        setAnimatedXP(profile.total_xp)
        clearInterval(timer)
      } else if (increment < 0 && current <= profile.total_xp) {
        setAnimatedXP(profile.total_xp)
        clearInterval(timer)
      } else {
        setAnimatedXP(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [profile.total_xp])

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'from-purple-500 via-pink-500 to-red-500'
    if (level >= 7) return 'from-blue-500 via-purple-500 to-pink-500'
    if (level >= 4) return 'from-green-500 via-blue-500 to-purple-500'
    return 'from-blue-400 via-cyan-400 to-teal-400'
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Experience</h3>
          <div className="flex items-center gap-3 mt-1">
            <motion.div
              animate={showXPGain ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
            >
              {Math.floor(animatedXP)} XP
            </motion.div>
            {showXPGain && recentXPGain && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold"
              >
                +{recentXPGain} XP
              </motion.div>
            )}
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getLevelColor(currentLevel)} shadow-lg`}
        >
          <div className="text-white text-xs font-semibold">LEVEL</div>
          <div className="text-white text-2xl font-bold">{currentLevel}</div>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Level {currentLevel}</span>
          <span className="font-medium">{xpInCurrentLevel} / {xpNeededForLevel} XP</span>
          <span className="font-medium">Level {currentLevel + 1}</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(currentLevel)} relative`}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
          </motion.div>
          {/* Progress percent label */}
          {progressPercent > 10 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {Math.floor(progressPercent)}%
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          {xpNeededForLevel - xpInCurrentLevel} XP until next level!
        </p>
      </div>

      {/* Level milestones */}
      {currentLevel % 5 === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-3"
        >
          <p className="text-sm font-semibold text-yellow-800 text-center">
            🎉 Milestone Level {currentLevel}! You're doing amazing!
          </p>
        </motion.div>
      )}
    </div>
  )
}
