'use client'

import { Profile } from '@/types/database'

interface ProgressStatsProps {
  profile: Profile
  completedQuests: number
  totalQuests: number
}

export default function ProgressStats({ profile, completedQuests, totalQuests }: ProgressStatsProps) {
  const progressPercentage = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">
            {profile.full_name || 'Adventurer'}
          </h2>
          <p className="text-blue-100">Level {profile.level}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{profile.total_points}</div>
          <div className="text-blue-100 text-sm">Total Points</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Quest Progress</span>
            <span className="font-semibold">
              {completedQuests} / {totalQuests}
            </span>
          </div>
          <div className="w-full bg-blue-900/50 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {profile.arrival_date && (
          <div className="pt-4 border-t border-blue-500/30">
            <p className="text-sm text-blue-100">
              In Finland since {new Date(profile.arrival_date).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
