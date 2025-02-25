
-- Add watched column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_movies' AND column_name = 'watched'
  ) THEN
    ALTER TABLE user_movies ADD COLUMN watched boolean DEFAULT false;
  END IF;
END $$;

-- Modify rating column to allow null values
ALTER TABLE user_movies ALTER COLUMN rating DROP NOT NULL;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_movies_user_id ON user_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movies_watched ON user_movies(watched);
CREATE INDEX IF NOT EXISTS idx_user_movies_watched_at ON user_movies(watched_at);