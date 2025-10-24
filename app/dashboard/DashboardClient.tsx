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

  const completedQuests = progress.filter((p) => p.completed).length
  const totalQuests = quests.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎯</span> Your Quests
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quests Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredQuests.map((quest) => {
            const questProgress = progress.find((p) => p.quest_id === quest.id)
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                progress={questProgress}
                onComplete={handleCompleteQuest}
              />
            )
          })}
        </div>

        {filteredQuests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No quests in this category yet.</p>
          </div>
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
