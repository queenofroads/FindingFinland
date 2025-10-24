-- ============================================
-- ADD XP VALUES TO EXISTING QUESTS
-- ============================================

-- This adds XP, regions, and completion quotes to your existing quests
-- Safe to run multiple times

-- Update all quests to have XP values (10-30 XP range)
UPDATE quests
SET xp = CASE
  WHEN points <= 10 THEN 10
  WHEN points <= 15 THEN 15
  WHEN points <= 20 THEN 20
  WHEN points <= 25 THEN 25
  ELSE 30
END
WHERE xp IS NULL OR xp = 0;

-- Add regions to quests (generic regions for now)
UPDATE quests
SET region = 'Nationwide'
WHERE region IS NULL;

-- Add completion quotes (generic fun quotes)
UPDATE quests
SET completion_quote = CASE category
  WHEN 'food' THEN 'Delicious! You''re one step closer to becoming a Finnish foodie! 🍽️'
  WHEN 'cultural' THEN 'You''re discovering the heart of Finnish culture! 🎭'
  WHEN 'social' THEN 'Great job building your Finnish network! 👥'
  WHEN 'legal' THEN 'Administrative achievement unlocked! You''re becoming a true resident! ⚖️'
  ELSE 'Quest completed! Keep exploring Finland! 🇫🇮'
END
WHERE completion_quote IS NULL;

-- Mark some popular quests as featured
UPDATE quests
SET is_featured = true
WHERE points >= 25
LIMIT 3;

-- Verify the changes
SELECT title, category, points, xp, region FROM quests ORDER BY category, points DESC;
