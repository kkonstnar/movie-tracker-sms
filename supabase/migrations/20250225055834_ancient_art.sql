
-- Create user_movies table
CREATE TABLE IF NOT EXISTS user_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  watched boolean DEFAULT false,
  watched_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS
ALTER TABLE user_movies ENABLE ROW LEVEL SECURITY;

-- Policies for user_movies
CREATE POLICY "Users can view their own movie interactions"
  ON user_movies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movie interactions"
  ON user_movies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movie interactions"
  ON user_movies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movie interactions"
  ON user_movies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_movies_updated_at
  BEFORE UPDATE ON user_movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();