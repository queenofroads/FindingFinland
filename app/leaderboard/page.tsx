import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LeaderboardEntry } from '@/types/database'
import LeaderboardClient from './LeaderboardClient'

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

  return <LeaderboardClient leaderboard={leaderboardData} currentUserId={user.id} />
}
