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
import { motion, AnimatePresence } from 'framer-motion'

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
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    'beginner': true,
    'intermediate': false,
    'advanced': false
  })
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

  // Organize quests by difficulty level based on XP
  const questsByLevel = {
    beginner: filteredQuests.filter(q => (q.xp || 0) <= 15),
    intermediate: filteredQuests.filter(q => (q.xp || 0) > 15 && (q.xp || 0) <= 25),
    advanced: filteredQuests.filter(q => (q.xp || 0) > 25)
  }

  const levelConfig = {
    beginner: {
      title: 'Level 1: Beginner',
      description: 'Perfect for getting started! (10-15 XP)',
      icon: '🌱',
      gradient: 'from-green-500 to-emerald-600',
      lightGradient: 'from-green-50 to-emerald-50',
      color: 'text-green-700'
    },
    intermediate: {
      title: 'Level 2: Intermediate',
      description: 'Ready for more challenge? (16-25 XP)',
      icon: '⭐',
      gradient: 'from-blue-500 to-purple-600',
      lightGradient: 'from-blue-50 to-purple-50',
      color: 'text-blue-700'
    },
    advanced: {
      title: 'Level 3: Advanced',
      description: 'For the brave adventurers! (26+ XP)',
      icon: '🔥',
      gradient: 'from-orange-500 to-red-600',
      lightGradient: 'from-orange-50 to-red-50',
      color: 'text-orange-700'
    }
  }

  const toggleLevel = (level: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }))
  }

  const completedQuests = progress.filter((p) => p.completed).length
  const totalQuests = quests.length

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.full_name || 'Adventurer'}! 👋</h1>
          <p className="text-gray-600">Here's your Finnish adventure progress</p>
        </div>

        {/* Stats Grid - Clean Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {/* Level Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Level</span>
              <span className="text-3xl">{profile.level >= 10 ? '👑' : profile.level >= 5 ? '⭐' : '🌱'}</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{profile.level}</div>
            <p className="text-sm text-gray-500 mt-1">Current level</p>
          </motion.div>

          {/* XP Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Experience</span>
              <span className="text-3xl">⚡</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{profile.total_xp || 0}</div>
            <p className="text-sm text-gray-500 mt-1">Total XP earned</p>
          </motion.div>

          {/* Completed Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{completedQuests}</div>
            <p className="text-sm text-gray-500 mt-1">Quests finished</p>
          </motion.div>

          {/* Progress Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-white/80">Progress</span>
              <span className="text-3xl">🎯</span>
            </div>
            <div className="text-4xl font-bold">{Math.round((completedQuests / totalQuests) * 100)}%</div>
            <p className="text-sm text-white/80 mt-1">{completedQuests}/{totalQuests} quests</p>
          </motion.div>
        </motion.div>

        {/* Quick Actions - Professional Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4"
        >
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBadges(!showBadges)}
            className="px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold shadow-sm hover:shadow-md flex items-center gap-2 transition-all"
          >
            <span>🏆</span> View Badges <span className="text-sm text-gray-500">({userBadges.length}/{badges.length})</span>
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSpin(!showSpin)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-sm hover:shadow-md flex items-center gap-2 transition-all"
          >
            <span>🎡</span> Daily Spin
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

        {/* Growth Dashboard */}
        <div className="space-y-6">
          {/* Section Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Growth Journey</h2>
            <p className="text-gray-600">Track your progress and achievements</p>
          </div>

          {/* Activity Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📊</span> Progress by Category
              </h3>
              <div className="space-y-4">
                {categories.filter(c => c.id !== 'all').map((category) => {
                  const categoryQuests = quests.filter(q => q.category === category.id)
                  const completedInCategory = categoryQuests.filter(q =>
                    progress.find(p => p.quest_id === q.id && p.completed)
                  ).length
                  const percentage = categoryQuests.length > 0 ? (completedInCategory / categoryQuests.length) * 100 : 0

                  return (
                    <div key={category.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </span>
                        <span className="text-sm text-gray-600">{completedInCategory}/{categoryQuests.length}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Level Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎯</span> Quest Difficulty
              </h3>
              <div className="space-y-4">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => {
                  const levelQuests = questsByLevel[level]
                  const config = levelConfig[level]
                  const completedInLevel = levelQuests.filter(q =>
                    progress.find(p => p.quest_id === q.id && p.completed)
                  ).length
                  const percentage = levelQuests.length > 0 ? (completedInLevel / levelQuests.length) * 100 : 0

                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.title}
                        </span>
                        <span className="text-sm text-gray-600">{completedInLevel}/{levelQuests.length}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🏆</span> Recent Achievements
              </h3>
              <Link href="/quests" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View All Quests →
              </Link>
            </div>

            {progress.filter(p => p.completed).length > 0 ? (
              <div className="space-y-3">
                {progress
                  .filter(p => p.completed)
                  .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
                  .slice(0, 5)
                  .map((p) => {
                    const quest = quests.find(q => q.id === p.quest_id)
                    if (!quest) return null

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-3xl">{quest.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{quest.title}</p>
                          <p className="text-sm text-gray-500">
                            Completed {new Date(p.completed_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">+{quest.xp} XP</span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">+{quest.points} pts</span>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-600 font-medium">No quests completed yet!</p>
                <p className="text-sm text-gray-500 mt-1">Start your first quest to begin your journey</p>
                <Link href="/quests">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-md"
                  >
                    Browse Quests
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Achievement Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl mb-2">🌱</div>
              <div className="text-2xl font-bold text-gray-900">{questsByLevel.beginner.filter(q => progress.find(p => p.quest_id === q.id && p.completed)).length}</div>
              <p className="text-xs text-gray-600 font-medium">Beginner Quests</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-gray-900">{questsByLevel.intermediate.filter(q => progress.find(p => p.quest_id === q.id && p.completed)).length}</div>
              <p className="text-xs text-gray-600 font-medium">Intermediate Quests</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-gray-900">{questsByLevel.advanced.filter(q => progress.find(p => p.quest_id === q.id && p.completed)).length}</div>
              <p className="text-xs text-gray-600 font-medium">Advanced Quests</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-gray-900">{userBadges.length}</div>
              <p className="text-xs text-gray-600 font-medium">Badges Earned</p>
            </div>
          </motion.div>
        </div>

        {/* Badge Unlock Notification */}
        <BadgeUnlockNotification
          badge={unlockedBadge}
          onClose={() => setUnlockedBadge(null)}
        />
      </div>
    </div>
  )
}
