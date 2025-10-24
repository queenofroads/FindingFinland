'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { createClient } from '@/lib/supabase/client'

interface DailySpinWheelProps {
  userId: string
  lastSpinDate: string | null
  onSpinComplete: (xpGained: number) => void
}

const SPIN_REWARDS = [
  { type: 'xp', value: 5, label: '+5 XP', color: '#3b82f6', emoji: '⚡' },
  { type: 'xp', value: 10, label: '+10 XP', color: '#8b5cf6', emoji: '✨' },
  { type: 'xp', value: 15, label: '+15 XP', color: '#ec4899', emoji: '🌟' },
  { type: 'xp', value: 20, label: '+20 XP', color: '#f59e0b', emoji: '💫' },
  { type: 'xp', value: 25, label: '+25 XP', color: '#10b981', emoji: '🎯' },
  { type: 'quest', value: 0, label: 'Surprise Quest', color: '#6366f1', emoji: '🎁' },
]

export default function DailySpinWheel({ userId, lastSpinDate, onSpinComplete }: DailySpinWheelProps) {
  const [canSpin, setCanSpin] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [reward, setReward] = useState<typeof SPIN_REWARDS[0] | null>(null)
  const [showReward, setShowReward] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkCanSpin()
  }, [lastSpinDate])

  const checkCanSpin = () => {
    const today = new Date().toISOString().split('T')[0]
    const lastSpin = lastSpinDate ? lastSpinDate.split('T')[0] : null
    setCanSpin(!lastSpin || lastSpin !== today)
  }

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return

    setIsSpinning(true)

    // Random reward
    const randomReward = SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)]
    const rewardIndex = SPIN_REWARDS.indexOf(randomReward)

    // Calculate rotation (multiple full spins + landing position)
    const segmentAngle = 360 / SPIN_REWARDS.length
    const targetRotation = 1440 + (360 - (rewardIndex * segmentAngle)) // 4 full spins + target

    setRotation(targetRotation)

    // Wait for spin animation
    setTimeout(async () => {
      setReward(randomReward)
      setShowReward(true)
      setIsSpinning(false)
      setCanSpin(false)

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Save spin to database
      try {
        const today = new Date().toISOString().split('T')[0]
        await supabase.from('daily_spins').insert({
          user_id: userId,
          spin_date: today,
          reward_type: randomReward.type,
          reward_value: randomReward.value,
        })

        // Update user XP if reward is XP
        if (randomReward.type === 'xp') {
          await supabase
            .from('profiles')
            .update({
              total_xp: supabase.raw(`total_xp + ${randomReward.value}`),
              daily_spin_last_used: today
            })
            .eq('id', userId)

          onSpinComplete(randomReward.value)
        }
      } catch (error) {
        console.error('Error saving spin:', error)
      }
    }, 4000)
  }

  const closeRewardModal = () => {
    setShowReward(false)
    setReward(null)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border-2 border-blue-100">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎡 Daily Spin
        </h2>
        <p className="text-gray-600">
          {canSpin ? 'Spin the Suomi Snack Wheel for rewards!' : 'Come back tomorrow for another spin!'}
        </p>
      </div>

      {/* Spin Wheel */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Pointer */}
        <div className="absolute top-0 z-20" style={{ transform: 'translateY(-20px)' }}>
          <div className="text-4xl">👇</div>
        </div>

        {/* Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: 'easeOut' }}
          className="relative w-80 h-80"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            {SPIN_REWARDS.map((segment, index) => {
              const angle = (360 / SPIN_REWARDS.length) * index
              const nextAngle = (360 / SPIN_REWARDS.length) * (index + 1)
              const startAngle = (angle - 90) * (Math.PI / 180)
              const endAngle = (nextAngle - 90) * (Math.PI / 180)

              const x1 = 100 + 90 * Math.cos(startAngle)
              const y1 = 100 + 90 * Math.sin(startAngle)
              const x2 = 100 + 90 * Math.cos(endAngle)
              const y2 = 100 + 90 * Math.sin(endAngle)

              const largeArc = nextAngle - angle > 180 ? 1 : 0

              return (
                <g key={index}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={100 + 60 * Math.cos((startAngle + endAngle) / 2)}
                    y={100 + 60 * Math.sin((startAngle + endAngle) / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="24"
                    transform={`rotate(${angle + 30}, ${100 + 60 * Math.cos((startAngle + endAngle) / 2)}, ${100 + 60 * Math.sin((startAngle + endAngle) / 2)})`}
                  >
                    {segment.emoji}
                  </text>
                </g>
              )
            })}
            {/* Center circle */}
            <circle cx="100" cy="100" r="20" fill="white" stroke="#3b82f6" strokeWidth="3" />
            <text x="100" y="105" textAnchor="middle" fill="#3b82f6" fontSize="20" fontWeight="bold">
              SPIN
            </text>
          </svg>
        </motion.div>
      </div>

      {/* Spin Button */}
      <motion.button
        whileHover={canSpin ? { scale: 1.05 } : {}}
        whileTap={canSpin ? { scale: 0.95 } : {}}
        onClick={handleSpin}
        disabled={!canSpin || isSpinning}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
          canSpin && !isSpinning
            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSpinning ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              🎡
            </motion.span>
            Spinning...
          </span>
        ) : canSpin ? (
          '🎯 SPIN NOW!'
        ) : (
          '🕐 Come Back Tomorrow'
        )}
      </motion.button>

      {/* Reward Modal */}
      <AnimatePresence>
        {showReward && reward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeRewardModal}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 0.6 }}
                className="text-8xl mb-4"
              >
                {reward.emoji}
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Congratulations!
              </h2>
              <div
                className="text-2xl font-bold mb-4 py-3 px-6 rounded-full inline-block text-white"
                style={{ backgroundColor: reward.color }}
              >
                {reward.label}
              </div>
              <p className="text-gray-600 mb-6">
                {reward.type === 'xp'
                  ? 'XP has been added to your account!'
                  : 'Check your quests for a surprise challenge!'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeRewardModal}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition"
              >
                Awesome! ✨
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
