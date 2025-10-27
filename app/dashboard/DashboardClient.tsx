'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Quest, UserQuestProgress, Profile, QuestCategory, Badge, UserBadge } from '@/types/database'
import QuestCard from '@/components/QuestCard'
import ProgressStats from '@/components/ProgressStats'
import XPProgressBar from '@/components/XPProgressBar'
import BadgesDisplay from '@/components/BadgesDisplay'
import DailySpinWheel from '@/components/DailySpinWheel'
import BadgeUnlockNotification from '@/components/BadgeUnlockNotification'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface DashboardClientProps {
  profile: Profile
  quests: Quest[]
  progress: UserQuestProgress[]
}

export default function DashboardClient({ profile: initialProfile, quests, progress: initialProgress }: DashboardClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [progress, setProgress] = useState(initialProgress)
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | 'all'>('all')
  const [badges, setBadges] = useState<Badge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null)
  const [recentXPGain, setRecentXPGain] = useState(0)
  const [showBadges, setShowBadges] = useState(false)
  const [showSpin, setShowSpin] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const QUESTS_PER_PAGE = 6
  const router = useRouter()
  const supabase = createClient()

  // Fetch badges and user badges
  useEffect(() => {
    fetchBadgesData()
  }, [])

  const fetchBadgesData = async () => {
    // Fetch all badges
    const { data: badgesData } = await supabase
      .from('badges')
      .select('*')
      .order('rarity')

    if (badgesData) setBadges(badgesData)

    // Fetch user's badges
    const { data: userBadgesData } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', profile.id)

    if (userBadgesData) setUserBadges(userBadgesData)
  }

  const refreshProfile = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleCompleteQuest = async (questId: string, notes?: string) => {
    try {
      const quest = quests.find((q) => q.id === questId)
      if (!quest) return

      // Insert or update progress (XP is handled automatically by database trigger)
      const { error: progressError } = await supabase
        .from('user_quest_progress')
        .upsert({
          user_id: profile.id,
          quest_id: questId,
          completed: true,
          completed_at: new Date().toISOString(),
          notes: notes || null,
        })

      if (progressError) throw progressError

      // Update user's total points (XP is updated by trigger)
      const newTotalPoints = profile.total_points + quest.points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ total_points: newTotalPoints })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // Show XP gain animation
      setRecentXPGain(quest.xp)
      setTimeout(() => setRecentXPGain(0), 3000)

      // Check for badge unlocks
      const { data: newBadges, error: badgeError } = await supabase
        .rpc('check_and_unlock_badges', { p_user_id: profile.id })

      if (!badgeError && newBadges && newBadges.length > 0) {
        // Show first unlocked badge
        const badge = badges.find(b => b.id === newBadges[0].badge_id)
        if (badge) {
          setTimeout(() => setUnlockedBadge(badge), 2000)
        }
        // Refresh badges data
        fetchBadgesData()
      }

      // Refresh profile to get updated XP and level
      await refreshProfile()

      // Update local state
      const existingProgress = progress.find((p) => p.quest_id === questId)
      if (existingProgress) {
        setProgress(
          progress.map((p) =>
            p.quest_id === questId
              ? { ...p, completed: true, completed_at: new Date().toISOString(), notes: notes || null, xp_earned: quest.xp }
              : p
          )
        )
      } else {
        setProgress([
          ...progress,
          {
            id: crypto.randomUUID(),
            user_id: profile.id,
            quest_id: questId,
            completed: true,
            completed_at: new Date().toISOString(),
            notes: notes || null,
            xp_earned: quest.xp,
            created_at: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error('Error completing quest:', error)
      alert('Failed to complete quest. Please try again.')
    }
  }

  const categories: { id: QuestCategory | 'all'; name: string; icon: string }[] = [
    { id: 'all', name: 'All Quests', icon: '🎯' },
    { id: 'legal', name: 'Legal', icon: '⚖️' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'cultural', name: 'Cultural', icon: '🎭' },
    { id: 'food', name: 'Food', icon: '🍴' },
  ]

  const filteredQuests = selectedCategory === 'all'
    ? quests
    : quests.filter((q) => q.category === selectedCategory)

  // Pagination
  const totalPages = Math.ceil(filteredQuests.length / QUESTS_PER_PAGE)
  const startIndex = (currentPage - 1) * QUESTS_PER_PAGE
  const endIndex = startIndex + QUESTS_PER_PAGE
  const paginatedQuests = filteredQuests.slice(startIndex, endIndex)

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const completedQuests = progress.filter((p) => p.completed).length
  const totalQuests = quests.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [0, -100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Finding Finland</h1>
            <div className="flex gap-4 items-center">
              <Link
                href="/leaderboard"
                className="text-gray-700 hover:text-blue-600 font-semibold transition"
              >
                Leaderboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProgressStats
            profile={profile}
            completedQuests={completedQuests}
            totalQuests={totalQuests}
          />
        </motion.div>

        {/* XP Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <XPProgressBar profile={profile} recentXPGain={recentXPGain} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBadges(!showBadges)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
          >
            <span>🏆</span> {showBadges ? 'Hide' : 'Show'} Badges ({userBadges.length}/{badges.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSpin(!showSpin)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
          >
            <span>🎡</span> {showSpin ? 'Hide' : 'Show'} Daily Spin
          </motion.button>
        </motion.div>

        {/* Badges Display */}
        {showBadges && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <BadgesDisplay badges={badges} userBadges={userBadges} />
          </motion.div>
        )}

        {/* Daily Spin Wheel */}
        {showSpin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <DailySpinWheel
              userId={profile.id}
              lastSpinDate={profile.daily_spin_last_used}
              onSpinComplete={(xpGained) => {
                setRecentXPGain(xpGained)
                refreshProfile()
                setTimeout(() => setRecentXPGain(0), 3000)
              }}
            />
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎯
              </motion.span>
              Your Quest Journey
            </h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-2xl font-bold shadow-lg"
            >
              {filteredQuests.length} {filteredQuests.length === 1 ? 'Quest' : 'Quests'}
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/30'
                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-2 border-gray-200 hover:border-gray-300 shadow-md'
                }`}
              >
                <span className="text-xl mr-2">{category.icon}</span>
                <span>{category.name}</span>
                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quests Grid */}
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-2"
        >
          {paginatedQuests.map((quest, index) => {
            const questProgress = progress.find((p) => p.quest_id === quest.id)
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <QuestCard
                  quest={quest}
                  progress={questProgress}
                  onComplete={handleCompleteQuest}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-white border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
            >
              ← Previous
            </motion.button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-2xl font-bold transition shadow-md ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-white border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
            >
              Next →
            </motion.button>
          </motion.div>
        )}

        {/* Showing X of Y quests indicator */}
        {filteredQuests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <p className="text-gray-600 font-medium">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredQuests.length)} of {filteredQuests.length} quests
            </p>
          </motion.div>
        )}

        {filteredQuests.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🔍
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Quests Found</h3>
            <p className="text-gray-600 text-lg">Try selecting a different category to see more adventures!</p>
          </motion.div>
        )}

        {/* Badge Unlock Notification */}
        <BadgeUnlockNotification
          badge={unlockedBadge}
          onClose={() => setUnlockedBadge(null)}
        />
      </div>
    </div>
  )
}
