'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LeaderboardEntry } from '@/types/database'

interface LeaderboardClientProps {
  leaderboard: LeaderboardEntry[]
  currentUserId: string
}

export default function LeaderboardClient({ leaderboard, currentUserId }: LeaderboardClientProps) {
  const features = [
    {
      icon: '✨',
      title: 'Complete Quests',
      description: 'Earn points for every quest you complete',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🎯',
      title: 'Difficulty Matters',
      description: 'Higher difficulty quests award more points',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏆',
      title: 'Bonus Achievements',
      description: 'Complete all quests in a category for bonuses',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '📈',
      title: 'Auto Updates',
      description: 'Your rank updates automatically as you progress',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Finding Finland</h1>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-semibold transition flex items-center gap-2"
            >
              <span>←</span> Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-gray-600">See how you rank among Finnish adventurers</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Top Adventurers</h2>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-600 font-medium">No users yet. Be the first!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.id === currentUserId
                    const isTop3 = index < 3
                    const rankIcons = ['🥇', '🥈', '🥉']
                    const rankBadges = [
                      'bg-gradient-to-r from-yellow-400 to-orange-400',
                      'bg-gradient-to-r from-gray-300 to-gray-400',
                      'bg-gradient-to-r from-amber-600 to-orange-600'
                    ]

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-6 transition-all ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className="relative">
                          {isTop3 ? (
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`flex items-center justify-center w-14 h-14 rounded-full ${rankBadges[index]} text-white font-bold text-xl shadow-lg`}
                            >
                              {rankIcons[index]}
                            </motion.div>
                          ) : (
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-700 font-bold text-lg">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="relative">
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-3xl shadow-md">
                            {entry.avatar_url ? (
                              <img
                                src={entry.avatar_url}
                                alt={entry.full_name || 'User'}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              '👤'
                            )}
                          </div>
                          {isTop3 && (
                            <div className="absolute -top-1 -right-1 text-xl">⭐</div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900 truncate">
                              {entry.full_name || 'Anonymous'}
                            </h3>
                            {isCurrentUser && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-purple-600">Level {entry.level}</span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              <span>✅</span>
                              <span className="font-medium">{entry.completed_quests} quests</span>
                            </span>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                          >
                            {entry.total_points.toLocaleString()}
                          </motion.div>
                          <div className="text-sm text-gray-500 font-medium">points</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Features Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* How to Climb Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">How to Climb 🚀</h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all cursor-pointer"
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white text-2xl shadow-md flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">🎯 Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Total Players</span>
                  <span className="text-2xl font-bold">{leaderboard.length}</span>
                </div>
                <div className="h-px bg-white/20"></div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Top Score</span>
                  <span className="text-2xl font-bold">
                    {leaderboard[0]?.total_points.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link href="/quests">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 text-white cursor-pointer"
              >
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-bold mb-2">Start Climbing!</h3>
                <p className="text-white/90 text-sm mb-3">Complete quests to boost your rank</p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>Browse Quests</span>
                  <span>→</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
