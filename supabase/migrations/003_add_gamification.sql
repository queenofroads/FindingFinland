-- ============================================
-- GAMIFICATION UPGRADE MIGRATION
-- Adds XP, Badges, Daily Spin, Map View
-- NO DATA LOSS - Only adds new features
-- ============================================

-- 1. ADD NEW COLUMNS TO EXISTING TABLES (non-breaking)
-- =====================================================

-- Add XP and total_xp to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_level_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_spin_last_used DATE;

-- Add new columns to quests table
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS completion_quote TEXT,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);

-- Add xp_earned to user_quest_progress
ALTER TABLE user_quest_progress
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;


-- 2. CREATE NEW TABLES FOR GAMIFICATION
-- ======================================

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlock_rule JSONB NOT NULL, -- Stores conditions like {"quests": ["quest-id-1", "quest-id-2"]}
  badge_color TEXT DEFAULT '#3b82f6',
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User badges (which badges each user has unlocked)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, badge_id)
);

-- Daily spins tracking
CREATE TABLE IF NOT EXISTS daily_spins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  spin_date DATE NOT NULL,
  reward_type TEXT NOT NULL, -- 'xp' or 'quest'
  reward_value INTEGER, -- XP amount or quest_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, spin_date)
);

-- Quest metadata for map pins and extra info
CREATE TABLE IF NOT EXISTS quest_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE UNIQUE,
  fun_fact TEXT,
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  estimated_time TEXT, -- e.g., '30 minutes'
  best_season TEXT, -- e.g., 'summer', 'winter', 'year-round'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);


-- 3. ENABLE RLS ON NEW TABLES
-- ============================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_metadata ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

-- User badges policies
CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Daily spins policies
CREATE POLICY "Users can view their own spins"
  ON daily_spins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spins"
  ON daily_spins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Quest metadata viewable by everyone
CREATE POLICY "Quest metadata is viewable by everyone"
  ON quest_metadata FOR SELECT
  USING (true);


-- 4. CREATE FUNCTIONS FOR XP AND BADGE LOGIC
-- ===========================================

-- Function to check and unlock badges for a user
CREATE OR REPLACE FUNCTION check_and_unlock_badges(p_user_id UUID)
RETURNS TABLE(badge_id UUID, badge_name TEXT, badge_icon TEXT) AS $$
DECLARE
  badge_record RECORD;
  quest_ids TEXT[];
  completed_quest_ids TEXT[];
  should_unlock BOOLEAN;
BEGIN
  -- Get all user's completed quests
  SELECT ARRAY_AGG(quest_id::TEXT)
  INTO completed_quest_ids
  FROM user_quest_progress
  WHERE user_id = p_user_id AND completed = true;

  -- Loop through all badges
  FOR badge_record IN SELECT * FROM badges LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badges.id = badge_record.id
    ) THEN
      -- Parse unlock rule
      quest_ids := ARRAY(SELECT jsonb_array_elements_text(badge_record.unlock_rule->'quests'));

      -- Check if all required quests are completed
      should_unlock := quest_ids <@ completed_quest_ids;

      -- Unlock badge if conditions met
      IF should_unlock THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (p_user_id, badge_record.id)
        ON CONFLICT DO NOTHING;

        RETURN QUERY SELECT badge_record.id, badge_record.name, badge_record.icon;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Simple formula: Level = floor(sqrt(XP / 100)) + 1
  -- Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
  RETURN FLOOR(SQRT(total_xp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update XP and level after quest completion
CREATE OR REPLACE FUNCTION update_user_xp_on_quest_complete()
RETURNS TRIGGER AS $$
DECLARE
  quest_xp INTEGER;
  new_total_xp INTEGER;
  new_level INTEGER;
BEGIN
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    -- Get quest XP
    SELECT xp INTO quest_xp FROM quests WHERE id = NEW.quest_id;

    -- Update user XP
    UPDATE profiles
    SET total_xp = total_xp + quest_xp
    WHERE id = NEW.user_id
    RETURNING total_xp INTO new_total_xp;

    -- Calculate and update level
    new_level := calculate_level(new_total_xp);
    UPDATE profiles SET level = new_level WHERE id = NEW.user_id;

    -- Store XP earned in progress record
    NEW.xp_earned := quest_xp;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update XP on quest completion
DROP TRIGGER IF EXISTS trigger_update_xp_on_quest_complete ON user_quest_progress;
CREATE TRIGGER trigger_update_xp_on_quest_complete
  BEFORE UPDATE ON user_quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_xp_on_quest_complete();


-- 5. UPDATE LEADERBOARD VIEW TO INCLUDE XP
-- =========================================

DROP VIEW IF EXISTS leaderboard;
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  id,
  full_name,
  total_points,
  total_xp,
  level,
  avatar_url,
  (SELECT COUNT(*) FROM user_quest_progress WHERE user_id = profiles.id AND completed = true) as completed_quests,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = profiles.id) as total_badges
FROM profiles
ORDER BY total_xp DESC, total_points DESC, completed_quests DESC
LIMIT 100;


-- 6. CREATE INDEXES FOR PERFORMANCE
-- ==================================

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_spins_user_date ON daily_spins(user_id, spin_date);
CREATE INDEX IF NOT EXISTS idx_quest_metadata_quest_id ON quest_metadata(quest_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_quests_category ON quests(category);
CREATE INDEX IF NOT EXISTS idx_quests_region ON quests(region);


-- 7. MIGRATION COMPLETE NOTIFICATION
-- ===================================
-- Insert a system notification that migration was successful
COMMENT ON TABLE badges IS 'Gamification upgrade v1.0 - Badges system';
COMMENT ON TABLE daily_spins IS 'Gamification upgrade v1.0 - Daily spin feature';
