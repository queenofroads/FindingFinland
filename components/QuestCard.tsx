'use client'

import { Quest, UserQuestProgress } from '@/types/database'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface QuestCardProps {
  quest: Quest
  progress?: UserQuestProgress
  onComplete: (questId: string, notes?: string) => Promise<void>
}

export default function QuestCard({ quest, progress, onComplete }: QuestCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const isCompleted = progress?.completed || false

  const triggerConfetti = () => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 }
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 100,
        startVelocity: 30,
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })
    fire(0.2, {
      spread: 60,
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  }

  const [showQuote, setShowQuote] = useState(false)

  const handleComplete = async () => {
    if (isCompleted) return

    setLoading(true)
    try {
      await onComplete(quest.id, notes)
      setJustCompleted(true)
      triggerConfetti()
      setShowDetails(false)
      setNotes('')

      // Show completion quote if available
      if (quest.completion_quote) {
        setTimeout(() => setShowQuote(true), 1500)
        setTimeout(() => setShowQuote(false), 6000)
      }

      // Reset animation after 3 seconds
      setTimeout(() => setJustCompleted(false), 3000)
    } catch (error) {
      console.error('Error completing quest:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryConfig = {
    legal: {
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      light: 'from-blue-50 to-indigo-50',
      accent: 'bg-blue-500',
      border: 'border-blue-200',
      shadow: 'shadow-blue-200/50',
      glow: 'shadow-blue-500/20',
      emoji: '⚖️'
    },
    social: {
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      light: 'from-purple-50 to-pink-50',
      accent: 'bg-purple-500',
      border: 'border-purple-200',
      shadow: 'shadow-purple-200/50',
      glow: 'shadow-purple-500/20',
      emoji: '👥'
    },
    cultural: {
      gradient: 'from-pink-500 via-rose-500 to-orange-500',
      light: 'from-pink-50 to-orange-50',
      accent: 'bg-pink-500',
      border: 'border-pink-200',
      shadow: 'shadow-pink-200/50',
      glow: 'shadow-pink-500/20',
      emoji: '🎭'
    },
    food: {
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      light: 'from-orange-50 to-yellow-50',
      accent: 'bg-orange-500',
      border: 'border-orange-200',
      shadow: 'shadow-orange-200/50',
      glow: 'shadow-orange-500/20',
      emoji: '🍴'
    },
  }

  const config = categoryConfig[quest.category]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: isCompleted ? 0.7 : 1,
        y: 0,
        scale: isCompleted ? 0.95 : 1
      }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      whileHover={!isCompleted ? { scale: 1.02, y: -4 } : {}}
      className={`relative group rounded-3xl overflow-hidden ${
        isCompleted
          ? 'bg-gradient-to-br from-gray-100 to-gray-200'
          : `bg-gradient-to-br ${config.light}`
      }`}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`} />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-white/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className={`relative border-2 ${isCompleted ? 'border-gray-300' : config.border} rounded-3xl ${isCompleted ? 'p-4' : 'p-6'} backdrop-blur-sm transition-all duration-300 ${
        !isCompleted && 'group-hover:shadow-2xl group-hover:' + config.glow
      }`}>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <motion.div
              whileHover={!isCompleted ? { rotate: [0, -10, 10, -10, 0], scale: 1.1 } : {}}
              transition={{ duration: 0.5 }}
              className={`${isCompleted ? 'text-3xl p-2' : 'text-5xl p-3'} bg-white rounded-2xl ${config.shadow} shadow-lg`}
            >
              {quest.icon}
            </motion.div>

            {/* Title and category */}
            <div className="flex-1">
              <h3 className={`font-bold ${isCompleted ? 'text-base' : 'text-xl'} ${isCompleted ? 'text-gray-600' : 'text-gray-900'} mb-2 leading-tight`}>
                {quest.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.gradient} shadow-md`}
                >
                  <span>{config.emoji}</span>
                  {quest.category.toUpperCase()}
                </motion.span>
                {quest.is_featured && (
                  <motion.span
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white shadow-md"
                  >
                    ⭐ FEATURED
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* Badges */}
          {!isCompleted && (
            <div className="flex flex-col gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 text-white font-bold px-4 py-2 rounded-2xl text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <span className="text-lg">⚡</span>
                <span>+{quest.xp} XP</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 text-white font-bold px-4 py-2 rounded-2xl text-sm shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                <span className="text-lg">🏆</span>
                <span>+{quest.points}</span>
              </motion.div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className={`${isCompleted ? 'text-gray-500 text-sm' : 'text-gray-700'} mb-4 leading-relaxed`}>{quest.description}</p>

        {/* Region Tag */}
        {quest.region && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="inline-flex items-center gap-2 text-sm text-gray-700 bg-white/80 px-4 py-2 rounded-full border-2 border-gray-200 shadow-sm font-medium backdrop-blur-sm">
              <span className="text-lg">📍</span>
              {quest.region}
            </span>
          </motion.div>
        )}

        {/* Action Button */}
        {!isCompleted && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDetails(!showDetails)}
            className={`w-full text-sm font-bold py-3 px-4 rounded-2xl bg-gradient-to-r ${config.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
          >
            {showDetails ? (
              <>
                <span>↑</span> Hide Details
              </>
            ) : (
              <>
                <span>🎯</span> Start Quest
              </>
            )}
          </motion.button>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex items-center justify-center gap-2 bg-gray-400 text-white font-semibold py-2 px-4 rounded-xl text-sm"
          >
            <span className="text-lg">✅</span>
            <span>Completed</span>
          </motion.div>
        )}

        {/* Details Panel */}
        <AnimatePresence>
          {showDetails && !isCompleted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-4">
                {quest.tips && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 border-2 border-yellow-200"
                  >
                    <p className="text-sm text-gray-800 flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <span><span className="font-bold">Pro Tip:</span> {quest.tips}</span>
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-lg">📝</span> Add Your Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How was your experience? Share your thoughts..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none bg-white/80 backdrop-blur-sm"
                      rows={3}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleComplete}
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-2xl transition shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base`}
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="text-2xl"
                        >
                          ⭐
                        </motion.span>
                        Completing...
                      </>
                    ) : (
                      <>
                        <span className="text-xl">✨</span>
                        Mark as Complete
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completed Info */}
        {isCompleted && progress?.completed_at && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 pt-6 border-t-2 border-emerald-300"
          >
            <p className="text-sm text-emerald-700 font-bold flex items-center gap-2 mb-2">
              <span className="text-xl">🎉</span>
              Completed on {new Date(progress.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {progress.notes && (
              <div className="bg-white/80 rounded-2xl p-4 border-2 border-emerald-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Your notes:</span> {progress.notes}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Just Completed Overlay */}
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-3xl z-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
              }}
              className="text-7xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}

        {/* Completion Quote Popup */}
        <AnimatePresence>
          {showQuote && quest.completion_quote && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 z-20"
            >
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-4 rounded-3xl shadow-2xl border-4 border-white">
                <p className="text-center font-bold text-sm flex items-center justify-center gap-2">
                  <span className="text-xl">💬</span>
                  {quest.completion_quote}
                </p>
              </div>
              {/* Speech bubble arrow */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
