export interface UserMovie {
  id: string;
  user_id: string;
  movie_id: number;
  rating: number | null;
  watched: boolean;
  watched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_movies: {
        Row: UserMovie;
        Insert: Omit<UserMovie, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserMovie, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}