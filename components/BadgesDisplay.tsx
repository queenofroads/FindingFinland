'use client'

import { Badge, UserBadge } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface BadgesDisplayProps {
  badges: Badge[]
  userBadges: UserBadge[]
}

export default function BadgesDisplay({ badges, userBadges }: BadgesDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [showLocked, setShowLocked] = useState(true)

  const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badge_id))
  const unlockedBadges = badges.filter(b => unlockedBadgeIds.has(b.id))
  const lockedBadges = badges.filter(b => !unlockedBadgeIds.has(b.id))

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 via-amber-500 to-orange-500'
      case 'epic': return 'from-purple-400 via-pink-500 to-rose-500'
      case 'rare': return 'from-blue-400 via-cyan-500 to-teal-500'
      default: return 'from-gray-300 via-gray-400 to-gray-500'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-200'
      case 'epic': return 'border-purple-400 shadow-purple-200'
      case 'rare': return 'border-blue-400 shadow-blue-200'
      default: return 'border-gray-300 shadow-gray-100'
    }
  }

  const getBadgeUnlockDate = (badgeId: string) => {
    const userBadge = userBadges.find(ub => ub.badge_id === badgeId)
    return userBadge?.unlocked_at
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏆 Badges</h2>
          <p className="text-sm text-gray-600 mt-1">
            {unlockedBadges.length} / {badges.length} unlocked
          </p>
        </div>
        <button
          onClick={() => setShowLocked(!showLocked)}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-semibold transition"
        >
          {showLocked ? 'Hide Locked' : 'Show All'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full"
          />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Unlocked badges */}
        {unlockedBadges.map((badge) => {
          const unlockDate = getBadgeUnlockDate(badge.id)
          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBadge(badge)}
              className={`relative cursor-pointer bg-gradient-to-br ${getRarityColor(badge.rarity)} p-[3px] rounded-xl ${getRarityBorder(badge.rarity)} shadow-lg`}
            >
              <div className="bg-white rounded-lg p-4 h-full flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-4xl mb-2"
                >
                  {badge.icon}
                </motion.div>
                <h3 className="text-xs font-bold text-gray-900 text-center line-clamp-2">
                  {badge.name}
                </h3>
                <span className={`text-[10px] font-semibold uppercase mt-1 bg-gradient-to-r ${getRarityColor(badge.rarity)} bg-clip-text text-transparent`}>
                  {badge.rarity}
                </span>
                {unlockDate && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(unlockDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
              {/* Sparkle effect */}
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-1 -right-1 text-yellow-400 text-xl"
              >
                ✨
              </motion.div>
            </motion.div>
          )
        })}

        {/* Locked badges */}
        {showLocked && lockedBadges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedBadge(badge)}
            className="relative cursor-pointer bg-gray-100 rounded-xl p-4 border-2 border-gray-300 shadow-sm opacity-60 hover:opacity-80 transition"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl mb-2 grayscale">
                🔒
              </div>
              <h3 className="text-xs font-bold text-gray-600 text-center line-clamp-2">
                {badge.name}
              </h3>
              <span className="text-[10px] font-semibold text-gray-400 uppercase mt-1">
                Locked
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Badge detail modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative bg-gradient-to-br ${getRarityColor(selectedBadge.rarity)} p-[4px] rounded-2xl max-w-md w-full shadow-2xl`}
            >
              <div className="bg-white rounded-xl p-8 text-center">
                <div className="text-7xl mb-4">
                  {unlockedBadgeIds.has(selectedBadge.id) ? selectedBadge.icon : '🔒'}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedBadge.name}
                </h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getRarityColor(selectedBadge.rarity)} text-white mb-4`}>
                  {selectedBadge.rarity.toUpperCase()}
                </span>
                <p className="text-gray-700 mb-6">
                  {selectedBadge.description}
                </p>

                {unlockedBadgeIds.has(selectedBadge.id) ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">✅ Unlocked!</p>
                    {getBadgeUnlockDate(selectedBadge.id) && (
                      <p className="text-sm text-green-600 mt-1">
                        Earned on {new Date(getBadgeUnlockDate(selectedBadge.id)!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">
                      Complete the required quests to unlock this badge!
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedBadge(null)}
                  className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
              {/* Close button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute -top-3 -right-3 w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg transition"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
