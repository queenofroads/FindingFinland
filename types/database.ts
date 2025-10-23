export type QuestCategory = 'legal' | 'social' | 'cultural' | 'food'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  arrival_date: string | null
  total_points: number
  level: number
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Quest {
  id: string
  title: string
  description: string
  category: QuestCategory
  points: number
  icon: string | null
  order_index: number
  tips: string | null
  created_at: string
}

export interface UserQuestProgress {
  id: string
  user_id: string
  quest_id: string
  completed: boolean
  completed_at: string | null
  notes: string | null
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string | null
  points_required: number | null
  badge_color: string
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

export interface LeaderboardEntry {
  id: string
  full_name: string | null
  total_points: number
  level: number
  avatar_url: string | null
  completed_quests: number
}

export interface QuestWithProgress extends Quest {
  progress?: UserQuestProgress
}
