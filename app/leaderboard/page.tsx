import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LeaderboardEntry } from '@/types/database'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch leaderboard data
  const { data: leaderboard, error: leaderboardError } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(50)

  if (leaderboardError) {
    console.error('Leaderboard error:', leaderboardError)
  }

  const leaderboardData = (leaderboard || []) as LeaderboardEntry[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Finding Finland</h1>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h2>
          <p className="text-gray-600">See how you rank among other Finnish adventurers!</p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 overflow-hidden">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users on the leaderboard yet. Be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboardData.map((entry, index) => {
                const isCurrentUser = entry.id === user.id
                const rankColors = [
                  'bg-gradient-to-r from-yellow-400 to-yellow-500',
                  'bg-gradient-to-r from-gray-300 to-gray-400',
                  'bg-gradient-to-r from-orange-400 to-orange-500',
                ]
                const rankColor = index < 3 ? rankColors[index] : 'bg-gray-100'
                const rankIcons = ['👑', '🥈', '🥉']

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-6 transition ${
                      isCurrentUser ? 'bg-blue-50 border-2 border-blue-300' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Rank */}
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${rankColor} text-white font-bold text-lg shadow`}
                    >
                      {index < 3 ? rankIcons[index] : index + 1}
                    </div>

                    {/* Avatar/Icon */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-3xl">
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.full_name || 'User'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        '🧑'
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {entry.full_name || 'Anonymous'}
                        </h3>
                        {isCurrentUser && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Level {entry.level}</span>
                        <span>•</span>
                        <span>{entry.completed_quests} quests completed</span>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {entry.total_points}
                      </div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg text-blue-900 mb-2">How to climb the leaderboard</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✨ Complete quests to earn points</li>
            <li>🎯 Higher difficulty quests award more points</li>
            <li>🏆 Complete all quests in a category for bonus achievements</li>
            <li>📈 Your rank updates automatically as you progress</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
