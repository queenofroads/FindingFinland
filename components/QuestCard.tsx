'use client'

import { Quest, UserQuestProgress } from '@/types/database'
import { useState } from 'react'

interface QuestCardProps {
  quest: Quest
  progress?: UserQuestProgress
  onComplete: (questId: string, notes?: string) => Promise<void>
}

export default function QuestCard({ quest, progress, onComplete }: QuestCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const isCompleted = progress?.completed || false

  const handleComplete = async () => {
    if (isCompleted) return

    setLoading(true)
    try {
      await onComplete(quest.id, notes)
      setShowDetails(false)
      setNotes('')
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

  const categoryBadgeColors = {
    legal: 'bg-blue-100 text-blue-800',
    social: 'bg-purple-100 text-purple-800',
    cultural: 'bg-pink-100 text-pink-800',
    food: 'bg-orange-100 text-orange-800',
  }

  return (
    <div
      className={`rounded-xl p-6 border-2 transition-all ${
        isCompleted
          ? 'bg-green-50 border-green-300 opacity-75'
          : categoryColors[quest.category]
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{quest.icon}</span>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{quest.title}</h3>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                categoryBadgeColors[quest.category]
              }`}
            >
              {quest.category.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm">
            {quest.points} pts
          </span>
          {isCompleted && (
            <span className="text-2xl">✅</span>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{quest.description}</p>

      {!isCompleted && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-2"
        >
          {showDetails ? 'Hide details ▲' : 'Show details ▼'}
        </button>
      )}

      {showDetails && !isCompleted && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {quest.tips && (
            <div className="bg-white/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">💡 Tip: </span>
                {quest.tips}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about completing this quest..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Marking complete...' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      )}

      {isCompleted && progress?.completed_at && (
        <div className="mt-4 pt-4 border-t border-green-300">
          <p className="text-sm text-green-700">
            ✨ Completed on {new Date(progress.completed_at).toLocaleDateString()}
          </p>
          {progress.notes && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">Notes:</span> {progress.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
