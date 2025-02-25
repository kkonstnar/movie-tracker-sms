
-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  release_year integer NOT NULL,
  poster_url text,
  backdrop_url text,
  overview text,
  imdb_rating decimal(3,1),
  rt_rating integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_movies table
CREATE TABLE IF NOT EXISTS user_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  user_rating decimal(3,1),
  watched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Create movie_genres table
CREATE TABLE IF NOT EXISTS movie_genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  genre text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create movie_cast table
CREATE TABLE IF NOT EXISTS movie_cast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL, -- 'actor', 'director', 'producer'
  character_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_cast ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Movies are viewable by everyone"
  ON movies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "User movies are viewable by owner"
  ON user_movies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movie ratings"
  ON user_movies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movie ratings"
  ON user_movies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movie ratings"
  ON user_movies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Movie genres are viewable by everyone"
  ON movie_genres FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Movie cast is viewable by everyone"
  ON movie_cast FOR SELECT
  TO public
  USING (true);