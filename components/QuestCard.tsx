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

  const categoryColors = {
    legal: 'bg-blue-50 border-blue-200 text-blue-700',
    social: 'bg-purple-50 border-purple-200 text-purple-700',
    cultural: 'bg-pink-50 border-pink-200 text-pink-700',
    food: 'bg-orange-50 border-orange-200 text-orange-700',
  }

  const categoryHoverColors = {
    legal: 'hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100',
    social: 'hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100',
    cultural: 'hover:border-pink-400 hover:shadow-lg hover:shadow-pink-100',
    food: 'hover:border-orange-400 hover:shadow-lg hover:shadow-orange-100',
  }

  const categoryBadgeColors = {
    legal: 'bg-blue-100 text-blue-800',
    social: 'bg-purple-100 text-purple-800',
    cultural: 'bg-pink-100 text-pink-800',
    food: 'bg-orange-100 text-orange-800',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: isCompleted ? 1 : 1.02 }}
      className={`rounded-xl p-6 border-2 transition-all cursor-pointer ${
        isCompleted
          ? 'bg-green-50 border-green-300'
          : `${categoryColors[quest.category]} ${categoryHoverColors[quest.category]}`
      } ${justCompleted ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-3xl"
            animate={justCompleted ? {
              scale: [1, 1.5, 1],
              rotate: [0, 360, 360],
            } : {}}
            transition={{ duration: 0.6 }}
          >
            {quest.icon}
          </motion.span>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{quest.title}</h3>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                categoryBadgeColors[quest.category]
              }`}
            >
              {quest.category.toUpperCase()}
            </motion.span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* XP Badge */}
          <motion.span
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md flex items-center gap-1"
          >
            <span>⚡</span> +{quest.xp} XP
          </motion.span>
          {/* Points Badge */}
          <motion.span
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md flex items-center gap-1"
          >
            <span>🏆</span> +{quest.points}
          </motion.span>
          {/* Featured badge */}
          {quest.is_featured && (
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-pink-400 to-rose-500 text-white font-bold px-2 py-1 rounded-full text-xs shadow-md"
            >
              ⭐ Featured
            </motion.span>
          )}
          {isCompleted && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-2xl"
            >
              ✅
            </motion.span>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-3">{quest.description}</p>

      {/* Region Tag */}
      {quest.region && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <span className="text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1">
            <span>📍</span> {quest.region}
          </span>
        </motion.div>
      )}

      {!isCompleted && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
        >
          {showDetails ? '↑ Hide details' : '↓ Show details & complete quest'}
        </motion.button>
      )}

      <AnimatePresence>
        {showDetails && !isCompleted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
          >
            {quest.tips && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/50 rounded-lg p-3 mb-4 border border-yellow-200"
              >
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">💡 Tip: </span>
                  {quest.tips}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share your experience completing this quest..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  rows={3}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⭐
                    </motion.span>
                    Completing...
                  </span>
                ) : (
                  '✨ Mark as Complete'
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCompleted && progress?.completed_at && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-green-300"
        >
          <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
            <span>🎉</span>
            Completed on {new Date(progress.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {progress.notes && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">Notes:</span> {progress.notes}
            </p>
          )}
        </motion.div>
      )}

      {justCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: 2,
            }}
            className="text-6xl"
          >
            🎉
          </motion.div>
        </motion.div>
      )}

      {/* Completion Quote Popup */}
      <AnimatePresence>
        {showQuote && quest.completion_quote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 z-10"
          >
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white">
              <p className="text-center font-semibold text-sm">
                💬 {quest.completion_quote}
              </p>
            </div>
            {/* Speech bubble arrow */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
