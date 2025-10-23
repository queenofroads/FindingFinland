'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Quest, UserQuestProgress, Profile, QuestCategory } from '@/types/database'
import QuestCard from '@/components/QuestCard'
import ProgressStats from '@/components/ProgressStats'
import Link from 'next/link'

interface DashboardClientProps {
  profile: Profile
  quests: Quest[]
  progress: UserQuestProgress[]
}

export default function DashboardClient({ profile: initialProfile, quests, progress: initialProgress }: DashboardClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [progress, setProgress] = useState(initialProgress)
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | 'all'>('all')
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleCompleteQuest = async (questId: string, notes?: string) => {
    try {
      const quest = quests.find((q) => q.id === questId)
      if (!quest) return

      // Insert or update progress
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

      // Update user's total points
      const newTotalPoints = profile.total_points + quest.points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ total_points: newTotalPoints })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // Update local state
      setProfile({ ...profile, total_points: newTotalPoints })

      const existingProgress = progress.find((p) => p.quest_id === questId)
      if (existingProgress) {
        setProgress(
          progress.map((p) =>
            p.quest_id === questId
              ? { ...p, completed: true, completed_at: new Date().toISOString(), notes: notes || null }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stats */}
        <div className="mb-8">
          <ProgressStats
            profile={profile}
            completedQuests={completedQuests}
            totalQuests={totalQuests}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Quest</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

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
      </div>
    </div>
  )
}
