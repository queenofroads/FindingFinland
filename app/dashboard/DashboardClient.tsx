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
        {/* Compact Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Profile Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-blue-200"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 shadow-lg">
                👤
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{profile.full_name || 'Adventurer'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{profile.level >= 10 ? '👑' : profile.level >= 5 ? '⭐' : '🌱'}</span>
                  <span className="text-sm font-bold text-blue-600">Level {profile.level}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* XP Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-100 font-semibold">Total Experience</p>
                <h3 className="text-4xl font-bold mt-1">{profile.total_xp || 0}</h3>
                <p className="text-xs text-cyan-100 mt-1">XP Points</p>
              </div>
              <div className="text-5xl">⚡</div>
            </div>
          </motion.div>

          {/* Quests Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100 font-semibold">Quest Progress</p>
                <h3 className="text-4xl font-bold mt-1">{completedQuests}/{totalQuests}</h3>
                <p className="text-xs text-purple-100 mt-1">{Math.round((completedQuests / totalQuests) * 100)}% Complete</p>
              </div>
              <div className="text-5xl">🎯</div>
            </div>
          </motion.div>
        </motion.div>

        {/* XP Progress Bar - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <XPProgressBar profile={profile} recentXPGain={recentXPGain} />
        </motion.div>

        {/* Quick Actions - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBadges(!showBadges)}
            className="px-5 py-2.5 bg-white border-2 border-purple-300 hover:border-purple-500 text-purple-700 rounded-2xl font-bold shadow-md flex items-center gap-2 transition"
          >
            <span>🏆</span> Badges ({userBadges.length}/{badges.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSpin(!showSpin)}
            className="px-5 py-2.5 bg-white border-2 border-blue-300 hover:border-blue-500 text-blue-700 rounded-2xl font-bold shadow-md flex items-center gap-2 transition"
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

        {/* Section Divider */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-6 py-2 text-2xl font-bold text-gray-800 rounded-full shadow-md border-2 border-gray-200">
              ✨ Start Your Adventure ✨
            </span>
          </div>
        </div>

        {/* Category Filter - Cleaner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>🎨</span> Choose Your Path
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quests by Level - Accordion Style */}
        <div className="space-y-6">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level, levelIndex) => {
            const levelQuests = questsByLevel[level]
            const config = levelConfig[level]
            const completedInLevel = levelQuests.filter(q =>
              progress.find(p => p.quest_id === q.id && p.completed)
            ).length

            if (levelQuests.length === 0) return null

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: levelIndex * 0.1 }}
                className={`bg-gradient-to-br ${config.lightGradient} rounded-3xl border-2 border-gray-200 shadow-xl overflow-hidden`}
              >
                {/* Level Header - Clickable */}
                <motion.button
                  onClick={() => toggleLevel(level)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full p-6 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={expandedLevels[level] ? { rotate: [0, -10, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                      className={`text-5xl bg-white rounded-2xl p-3 shadow-lg`}
                    >
                      {config.icon}
                    </motion.div>
                    <div className="text-left">
                      <h3 className={`text-2xl font-bold ${config.color} flex items-center gap-2`}>
                        {config.title}
                        <span className={`text-sm px-3 py-1 rounded-full bg-gradient-to-r ${config.gradient} text-white`}>
                          {completedInLevel}/{levelQuests.length}
                        </span>
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{config.description}</p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: expandedLevels[level] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl"
                  >
                    ▼
                  </motion.div>
                </motion.button>

                {/* Level Content - Collapsible */}
                <AnimatePresence>
                  {expandedLevels[level] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden border-2 border-gray-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(completedInLevel / levelQuests.length) * 100}%` }}
                              transition={{ duration: 0.8 }}
                              className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2 text-center font-medium">
                            {completedInLevel === levelQuests.length
                              ? '🎉 Level Complete!'
                              : `${levelQuests.length - completedInLevel} quests remaining`
                            }
                          </p>
                        </div>

                        {/* Quests Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                          {levelQuests.map((quest, index) => {
                            const questProgress = progress.find((p) => p.quest_id === quest.id)
                            return (
                              <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <QuestCard
                                  quest={quest}
                                  progress={questProgress}
                                  onComplete={handleCompleteQuest}
                                />
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

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
