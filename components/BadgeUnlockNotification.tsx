'use client'

import { Badge } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

interface BadgeUnlockNotificationProps {
  badge: Badge | null
  onClose: () => void
}

export default function BadgeUnlockNotification({ badge, onClose }: BadgeUnlockNotificationProps) {
  useEffect(() => {
    if (badge) {
      // Trigger epic confetti
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1'],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1'],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()

      // Auto close after 5 seconds
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [badge, onClose])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 via-amber-500 to-orange-500'
      case 'epic': return 'from-purple-400 via-pink-500 to-rose-500'
      case 'rare': return 'from-blue-400 via-cyan-500 to-teal-500'
      default: return 'from-gray-300 via-gray-400 to-gray-500'
    }
  }

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 0.9, 1.05, 1],
              rotate: [- 180, 0],
              opacity: 1,
            }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              duration: 0.8,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(badge.rarity)} opacity-50 blur-3xl animate-pulse`} />

            {/* Main card */}
            <div className={`relative bg-gradient-to-br ${getRarityColor(badge.rarity)} p-[4px] rounded-3xl shadow-2xl`}>
              <div className="bg-white rounded-3xl p-8 text-center">
                {/* Header */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    🎉 NEW BADGE UNLOCKED! 🎉
                  </div>
                </motion.div>

                {/* Badge icon */}
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="my-8"
                >
                  <div className="text-9xl">{badge.icon}</div>
                </motion.div>

                {/* Badge name */}
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {badge.name}
                </h2>

                {/* Rarity badge */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className={`inline-block px-6 py-2 rounded-full text-lg font-bold bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white mb-4 shadow-lg`}
                >
                  ✨ {badge.rarity.toUpperCase()} ✨
                </motion.div>

                {/* Description */}
                <p className="text-lg text-gray-700 mb-8">
                  {badge.description}
                </p>

                {/* Decorative elements */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-3xl"
                  >
                    ⭐
                  </motion.span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-3xl"
                  >
                    💫
                  </motion.span>
                  <motion.span
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-3xl"
                  >
                    ✨
                  </motion.span>
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition shadow-lg"
                >
                  Awesome! 🎊
                </motion.button>
              </div>
            </div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 1,
                }}
                animate={{
                  x: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 150}%`,
                  y: `${50 + Math.sin((i * 60 * Math.PI) / 180) * 150}%`,
                  opacity: 0,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              >
                {['✨', '⭐', '💫', '🌟', '⚡', '🎯'][i]}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
