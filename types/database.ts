export type QuestCategory = 'legal' | 'social' | 'cultural' | 'food'
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type RewardType = 'xp' | 'quest'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  arrival_date: string | null
  total_points: number
  total_xp: number
  current_level_xp: number
  level: number
  avatar_url: string | null
  daily_spin_last_used: string | null
  created_at: string
  updated_at: string
}

export interface Quest {
  id: string
  title: string
  description: string
  category: QuestCategory
  points: number
  xp: number
  icon: string | null
  order_index: number
  tips: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  is_featured: boolean
  completion_quote: string | null
  created_at: string
}

export interface UserQuestProgress {
  id: string
  user_id: string
  quest_id: string
  completed: boolean
  completed_at: string | null
  notes: string | null
  xp_earned: number
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

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlock_rule: Record<string, any>
  badge_color: string
  rarity: BadgeRarity
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  unlocked_at: string
}

export interface DailySpin {
  id: string
  user_id: string
  spin_date: string
  reward_type: RewardType
  reward_value: number | null
  created_at: string
}

export interface QuestMetadata {
  id: string
  quest_id: string
  fun_fact: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_time: string | null
  best_season: string | null
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  full_name: string | null
  total_points: number
  total_xp: number
  level: number
  avatar_url: string | null
  completed_quests: number
  total_badges: number
}

export interface QuestWithProgress extends Quest {
  progress?: UserQuestProgress
  metadata?: QuestMetadata
}

export interface BadgeWithProgress extends Badge {
  unlocked?: boolean
  unlocked_at?: string
}
