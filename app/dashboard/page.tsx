import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import { Quest, UserQuestProgress, Profile } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch profile
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
    .order('category')
    .order('order_index')

  if (questsError) {
    console.error('Quests error:', questsError)
  }

  // Fetch user's progress
  const { data: progress, error: progressError } = await supabase
    .from('user_quest_progress')
    .select('*')
    .eq('user_id', user.id)

  if (progressError) {
    console.error('Progress error:', progressError)
  }

  return (
    <DashboardClient
      profile={profile as Profile}
      quests={(quests || []) as Quest[]}
      progress={(progress || []) as UserQuestProgress[]}
    />
  )
}
