-- ============================================
-- SEED GAMIFICATION DATA
-- Badges, Cultural Quests, Regions, Quotes
-- ============================================

-- 1. UPDATE EXISTING QUESTS WITH XP, REGIONS, AND QUOTES
-- =======================================================

-- Update food quests with regions and fun completion quotes
UPDATE quests SET
  xp = 15,
  region = 'Karelia',
  latitude = 62.8924,
  longitude = 27.6782,
  completion_quote = 'You survived the Karelian treasure! One step closer to becoming a Finn 🥧'
WHERE title LIKE '%Karjalanpiirakka%';

UPDATE quests SET
  xp = 20,
  region = 'Nationwide',
  completion_quote = 'You survived Mämmi! You''re officially one of us 🇫🇮'
WHERE title LIKE '%Mämmi%';

UPDATE quests SET
  xp = 10,
  region = 'Nationwide',
  completion_quote = 'Smells like heaven, tastes like home 🍞'
WHERE title LIKE '%Ruisleipä%' OR title LIKE '%Rye Bread%';

UPDATE quests SET
  xp = 15,
  region = 'Helsinki',
  latitude = 60.1699,
  longitude = 24.9384,
  completion_quote = 'Caffeine level: Finnish. You can conquer anything now ☕'
WHERE title LIKE '%Coffee%' OR title LIKE '%Kahvi%';

UPDATE quests SET
  xp = 15,
  region = 'Nationwide',
  completion_quote = 'Sweet, cinnamon-y, and utterly Finnish. Well done! 🥐'
WHERE title LIKE '%Korvapuusti%' OR title LIKE '%Cinnamon%';

UPDATE quests SET
  xp = 20,
  region = 'Lapland',
  latitude = 68.4187,
  longitude = 23.6689,
  completion_quote = 'You tasted reindeer! Lapland approves 🦌'
WHERE title LIKE '%Reindeer%' OR title LIKE '%Poron%';

UPDATE quests SET
  xp = 25,
  region = 'Archipelago',
  latitude = 60.3000,
  longitude = 22.2667,
  completion_quote = 'Baltic herring = peak Finnish cuisine. You nailed it! 🐟'
WHERE title LIKE '%Silakka%' OR title LIKE '%Baltic%';

UPDATE quests SET
  xp = 10,
  region = 'Nationwide',
  completion_quote = 'Salmiakki is proof that Finns have superpowers 🖤'
WHERE title LIKE '%Salmiakki%';

UPDATE quests SET
  xp = 30,
  region = 'Tampere',
  latitude = 61.4978,
  longitude = 23.7610,
  completion_quote = 'Mustamakkara in Tampere = pure bliss. Local status unlocked! 🌭'
WHERE title LIKE '%Mustamakkara%';

UPDATE quests SET
  xp = 15,
  region = 'Nationwide',
  completion_quote = 'Design that smiles back 🍫'
WHERE title LIKE '%Fazer%';


-- 2. INSERT NEW CULTURAL QUESTS
-- ==============================

INSERT INTO quests (title, description, category, points, xp, icon, region, latitude, longitude, completion_quote, is_featured, tips)
VALUES
  (
    'Visit a Marimekko Store',
    'Step into a Marimekko store and immerse yourself in iconic Finnish design. Bonus points if you buy something with the Unikko poppy pattern!',
    'cultural',
    20,
    20,
    '🌸',
    'Helsinki',
    60.1699,
    24.9384,
    'You just leveled up your style game. Welcome to the world of Marimekko! 🌺',
    true,
    'Find stores in Helsinki city center or at Stockmann. The flagship store is at Pohjoisesplanadi 31.'
  ),
  (
    'Try a Finnish Sauna',
    'Experience the heart of Finnish culture – the sauna. Relax, sweat it out, and embrace the Finnish way of life.',
    'cultural',
    30,
    30,
    '🧖',
    'Nationwide',
    NULL,
    NULL,
    'You''ve unlocked peak Finnish relaxation. Sisu achieved! 🔥',
    true,
    'Many public swimming halls have saunas. Try Yrjönkatu Swimming Hall in Helsinki or any local gym. Remember: Finns sauna naked!'
  ),
  (
    'Photo with a Moomin',
    'Find a Moomin character (statue, store display, or merchandise) and snap a selfie! Moomins are beloved Finnish icons.',
    'cultural',
    15,
    15,
    '🦛',
    'Helsinki',
    60.1699,
    24.9384,
    'Moomin magic captured! You''re now part of Finnish childhood nostalgia 📸',
    false,
    'Visit the Moomin Shop in Helsinki, or the Moomin Museum in Tampere. Moomin World in Naantali is open in summer!'
  ),
  (
    'Taste Fazer Chocolate',
    'Try Finland''s most famous chocolate brand. The classic Fazer Blue (Sininen) is a must-try!',
    'food',
    10,
    10,
    '🍫',
    'Nationwide',
    NULL,
    NULL,
    'Design that smiles back. Fazer has been delighting Finns since 1891! 😋',
    false,
    'Available at any supermarket (K-Market, S-Market, Alepa). Try Fazer Blue, Geisha, or Dumle!'
  ),
  (
    'Visit Iittala/Arabia Design Store',
    'Explore the beautiful world of Iittala glassware and Arabia ceramics – Finnish design at its finest.',
    'cultural',
    20,
    20,
    '🏺',
    'Helsinki',
    60.1699,
    24.9384,
    'You just experienced timeless Finnish craftsmanship. Scandinavia would be proud! ✨',
    false,
    'Visit the Arabia Design Centre in Helsinki or any Iittala store. Check out the iconic Alvar Aalto vase!'
  ),
  (
    'Try Karjalanpiirakka (Karelian Pasty)',
    'Taste this traditional Karelian pastry made with rye crust and rice filling. Best enjoyed with egg butter (munavoi)!',
    'food',
    15,
    15,
    '🥧',
    'Karelia',
    62.8924,
    27.6782,
    'You survived the Karelian treasure! One step closer to becoming a Finn 🥧',
    true,
    'Find at any bakery or supermarket. Heat it up and top with egg butter (mix of butter and boiled eggs).'
  ),
  (
    'Attend a Finnish Music Festival',
    'Experience Finnish music culture! From heavy metal to folk, Finland loves its festivals.',
    'cultural',
    25,
    25,
    '🎸',
    'Nationwide',
    NULL,
    NULL,
    'You''ve officially experienced Finnish music madness. Kippis! 🎶',
    false,
    'Check out Tuska (metal), Flow Festival (indie), or Ruisrock (rock). Most happen in summer!'
  ),
  (
    'Join a Finnish Language Meetup',
    'Practice your Finnish with locals! Join a language café or conversation group.',
    'social',
    20,
    20,
    '💬',
    'Helsinki',
    60.1699,
    24.9384,
    'Hyvä! Your Finnish is getting better every day 🗣️',
    false,
    'Search for "Finnish language café" on Facebook or Meetup.com. Libraries often host free sessions!'
  );

-- Update some existing quests to be featured
UPDATE quests SET is_featured = true
WHERE title IN ('Try Finnish Coffee', 'Visit a Finnish Sauna', 'Try Karjalanpiirakka (Karelian Pasty)');


-- 3. INSERT BADGES
-- =================

INSERT INTO badges (name, description, icon, unlock_rule, badge_color, rarity)
VALUES
  (
    'Rye Royalty',
    'Unlock by trying both Ruisleipä and Mämmi – you''ve mastered Finnish rye!',
    '🍞',
    '{"quests": ["quest_ruisleipa_id", "quest_mammi_id"]}'::jsonb,
    '#8B4513',
    'rare'
  ),
  (
    'Caffeine Royalty',
    'Complete Finnish Coffee quest plus any 2 bakery items (Korvapuusti, Pulla, etc.)',
    '☕',
    '{"quests": ["quest_coffee_id"], "category_count": {"food": 2}}'::jsonb,
    '#6F4E37',
    'rare'
  ),
  (
    'Design Diva',
    'Visit Marimekko AND Iittala/Arabia stores – you appreciate Finnish design!',
    '🎨',
    '{"quests": ["quest_marimekko_id", "quest_iittala_id"]}'::jsonb,
    '#FF69B4',
    'epic'
  ),
  (
    'Sauna Master',
    'Experience the Finnish sauna – the ultimate cultural achievement!',
    '🔥',
    '{"quests": ["quest_sauna_id"]}'::jsonb,
    '#FF4500',
    'legendary'
  ),
  (
    'Moomin Friend',
    'Captured a moment with Finland''s beloved Moomins!',
    '🦛',
    '{"quests": ["quest_moomin_id"]}'::jsonb,
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
    'XP Champion',
    'Reach 500 total XP – dedication level: Finnish!',
    '⭐',
    '{"min_xp": 500}'::jsonb,
    '#FFD700',
    'epic'
  );

-- Note: The quest IDs in unlock_rules will need to be updated after quests are created
-- This is handled in the application logic


-- 4. ADD QUEST METADATA
-- ======================

-- Add fun facts and difficulty ratings for some quests
INSERT INTO quest_metadata (quest_id, fun_fact, difficulty, estimated_time, best_season)
SELECT
  id,
  CASE
    WHEN title LIKE '%Sauna%' THEN 'Finland has about 3 million saunas for 5.5 million people!'
    WHEN title LIKE '%Mämmi%' THEN 'Mämmi is an Easter tradition that foreigners either love or hate – no in-between!'
    WHEN title LIKE '%Coffee%' THEN 'Finns drink more coffee per capita than any other nation – about 12kg per person annually!'
    WHEN title LIKE '%Reindeer%' THEN 'There are more reindeer than people in Lapland!'
    WHEN title LIKE '%Salmiakki%' THEN 'Salmiakki (salty licorice) is Finland''s ultimate taste test for foreigners!'
    WHEN title LIKE '%Marimekko%' THEN 'Marimekko''s Unikko poppy pattern was designed in 1964 and is still iconic today!'
    ELSE 'Experience authentic Finnish culture!'
  END as fun_fact,
  CASE
    WHEN title LIKE '%Sauna%' THEN 'easy'
    WHEN title LIKE '%Mämmi%' THEN 'hard'
    WHEN title LIKE '%Salmiakki%' THEN 'hard'
    WHEN title LIKE '%Mustamakkara%' THEN 'medium'
    ELSE 'easy'
  END as difficulty,
  CASE
    WHEN title LIKE '%Sauna%' THEN '1-2 hours'
    WHEN title LIKE '%Visit%' OR title LIKE '%Store%' THEN '30-60 minutes'
    WHEN title LIKE '%Festival%' THEN '4-8 hours'
    WHEN title LIKE '%Meetup%' THEN '1-2 hours'
    ELSE '15-30 minutes'
  END as estimated_time,
  CASE
    WHEN title LIKE '%Mämmi%' THEN 'spring'
    WHEN title LIKE '%Festival%' THEN 'summer'
    WHEN title LIKE '%Sauna%' THEN 'year-round'
    ELSE 'year-round'
  END as best_season
FROM quests
WHERE category IN ('food', 'cultural');


-- 5. GRANT NECESSARY PERMISSIONS
-- ===============================

-- Ensure RLS policies work correctly
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;


-- 6. SUCCESS MESSAGE
-- ==================
DO $$
BEGIN
  RAISE NOTICE '✅ Gamification data seeded successfully!';
  RAISE NOTICE '📊 New badges: 11';
  RAISE NOTICE '🎯 New cultural quests: 8';
  RAISE NOTICE '🗺️  Regions added to existing quests';
  RAISE NOTICE '💬 Completion quotes added';
  RAISE NOTICE '🎮 System ready for XP, badges, and daily spins!';
END $$;
