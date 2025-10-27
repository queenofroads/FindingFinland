import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QuestsClient from './QuestsClient'

export default async function QuestsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile error:', profileError)
    redirect('/login')
  }

  // Fetch all quests
  const { data: quests, error: questsError } = await supabase
    .from('quests')
    .select('*')
    .order('xp', { ascending: true })

  if (questsError) {
    console.error('Error fetching quests:', questsError)
    return <div>Error loading quests</div>
  }

  // Fetch user progress
  const { data: progress, error: progressError } = await supabase
    .from('user_quest_progress')
    .select('*')
    .eq('user_id', user.id)

  if (progressError) {
    console.error('Error fetching progress:', progressError)
  }

  return (
    <QuestsClient
      profile={profile}
      quests={quests || []}
      progress={progress || []}
    />
  )
}
