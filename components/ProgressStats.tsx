'use client'

import { Profile } from '@/types/database'
import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'

interface ProgressStatsProps {
  profile: Profile
  completedQuests: number
  totalQuests: number
}

export default function ProgressStats({ profile, completedQuests, totalQuests }: ProgressStatsProps) {
  const progressPercentage = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0
  const [animatedPoints, setAnimatedPoints] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Generate fixed particle positions (stable across renders)
  const particlePositions = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: [Math.sin(i * 0.5) * 200, Math.cos(i * 0.5) * 200],
      y: [Math.cos(i * 0.5) * 100, Math.sin(i * 0.5) * 100],
      left: 10 + (i * 4.5) % 90,
      top: 10 + ((i * 7) % 80),
      duration: 3 + (i % 3),
      delay: (i % 4) * 0.5,
    }))
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Animate points counter
  useEffect(() => {
    if (!isMounted) return

    const duration = 1500
    const steps = 60
    const increment = profile.total_points / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= profile.total_points) {
        setAnimatedPoints(profile.total_points)
        clearInterval(timer)
      } else {
        setAnimatedPoints(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [profile.total_points, isMounted])

  // Animate progress bar
  useEffect(() => {
    if (!isMounted) return

    const duration = 1000
    const steps = 50
    const increment = progressPercentage / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= progressPercentage) {
        setAnimatedProgress(progressPercentage)
        clearInterval(timer)
      } else {
        setAnimatedProgress(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [progressPercentage, isMounted])

  const getLevelEmoji = (level: number) => {
    if (level === 1) return '🌱'
    if (level <= 3) return '🌿'
    if (level <= 5) return '🌳'
    if (level <= 10) return '⭐'
    return '👑'
  }

  const getProgressMessage = () => {
    if (progressPercentage === 100) return "You're an Honorary Finn! 🇫🇮"
    if (progressPercentage >= 75) return "Almost there, sisu strong! 💪"
    if (progressPercentage >= 50) return "Halfway to becoming a Finn! 🎯"
    if (progressPercentage >= 25) return "Making great progress! 🚀"
    return "Your Finnish adventure begins! ✨"
  }

  if (!isMounted) {
    // Return non-animated version for SSR
    return (
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-1">
              {profile.full_name || 'Adventurer'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getLevelEmoji(profile.level)}</span>
              <p className="text-blue-100 font-semibold">Level {profile.level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-2">
              <div className="text-4xl font-bold">{profile.total_points}</div>
              <div className="text-blue-100 text-sm mt-1">Points</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 border-2 border-cyan-300 shadow-lg">
              <div className="text-3xl font-bold flex items-center gap-1">
                <span>⚡</span>{profile.total_xp || 0}
              </div>
              <div className="text-cyan-100 text-sm mt-1">Total XP</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particlePositions.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: particle.x,
              y: particle.y,
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h2
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-3xl font-bold mb-1"
            >
              {profile.full_name || 'Adventurer'}
            </motion.h2>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl">{getLevelEmoji(profile.level)}</span>
              <p className="text-blue-100 font-semibold">Level {profile.level}</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="text-right"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-2">
              <motion.div
                key={animatedPoints}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold"
              >
                {animatedPoints}
              </motion.div>
              <div className="text-blue-100 text-sm mt-1">Points</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 border-2 border-cyan-300 shadow-lg">
              <motion.div
                key={profile.total_xp}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold flex items-center gap-1"
              >
                <span>⚡</span>{profile.total_xp || 0}
              </motion.div>
              <div className="text-cyan-100 text-sm mt-1">Total XP</div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-3">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-semibold"
              >
                Quest Progress
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-bold bg-white/20 px-3 py-1 rounded-full"
              >
                {completedQuests} / {totalQuests}
              </motion.span>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${animatedProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-gradient-to-r from-white via-blue-100 to-white h-full rounded-full relative"
              >
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
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-blue-100 mt-2 text-center font-semibold"
            >
              {getProgressMessage()}
            </motion.p>
          </div>

          {profile.arrival_date && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-4 border-t border-blue-500/30"
            >
              <p className="text-sm text-blue-100 flex items-center gap-2">
                <span className="text-xl">📅</span>
                <span>
                  In Finland since {new Date(profile.arrival_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
