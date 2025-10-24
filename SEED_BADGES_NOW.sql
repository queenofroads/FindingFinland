-- ============================================
-- SEED BADGE DATA - Run this in Supabase!
-- ============================================

-- This will create 11 badges for your gamification system
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)

INSERT INTO badges (name, description, icon, unlock_rule, badge_color, rarity)
VALUES
  (
    'Rookie Finn',
    'Complete your first 3 quests – welcome to the journey!',
    '🌟',
    '{"total_quests": 3}'::jsonb,
    '#32CD32',
    'common'
  ),
  (
    'True Finn',
    'Complete 15 quests total – you''re practically Finnish now!',
    '🇫🇮',
    '{"total_quests": 15}'::jsonb,
    '#003580',
    'legendary'
  ),
  (
    'Rye Royalty',
    'Unlock by trying both Ruisleipä and Mämmi – you''ve mastered Finnish rye!',
    '🍞',
    '{"category_count": {"food": 2}}'::jsonb,
    '#8B4513',
    'rare'
  ),
  (
    'Caffeine Royalty',
    'Complete Finnish Coffee quest plus any 2 bakery items',
    '☕',
    '{"category_count": {"food": 3}}'::jsonb,
    '#6F4E37',
    'rare'
  ),
  (
    'Design Diva',
    'Visit Marimekko AND Iittala/Arabia stores – you appreciate Finnish design!',
    '🎨',
    '{"category_count": {"cultural": 2}}'::jsonb,
    '#FF69B4',
    'epic'
  ),
  (
    'Sauna Master',
    'Experience the Finnish sauna – the ultimate cultural achievement!',
    '🔥',
    '{"category_count": {"cultural": 1}}'::jsonb,
    '#FF4500',
    'legendary'
  ),
  (
    'Moomin Friend',
    'Captured a moment with Finland''s beloved Moomins!',
    '🦛',
    '{"category_count": {"cultural": 1}}'::jsonb,
    '#4169E1',
    'common'
  ),
  (
    'Food Explorer',
    'Complete 5 different food quests – you''re a true Finnish food adventurer!',
    '🍽️',
    '{"category_count": {"food": 5}}'::jsonb,
    '#FFD700',
    'rare'
  ),
  (
    'Cultural Connoisseur',
    'Complete 4 cultural quests – you understand Finland beyond the food!',
    '🎭',
    '{"category_count": {"cultural": 4}}'::jsonb,
    '#9370DB',
    'epic'
  ),
  (
    'Social Butterfly',
    'Complete 3 social quests – you''re building your Finnish network!',
    '🦋',
    '{"category_count": {"social": 3}}'::jsonb,
    '#FF1493',
    'rare'
  ),
  (
    'XP Champion',
    'Reach 500 total XP – dedication level: Finnish!',
    '⭐',
    '{"min_xp": 500}'::jsonb,
    '#FFD700',
    'epic'
  )
ON CONFLICT (name) DO NOTHING;

-- Verify badges were created
SELECT COUNT(*) as total_badges FROM badges;

-- Show all badges
SELECT name, rarity, icon FROM badges ORDER BY rarity, name;
