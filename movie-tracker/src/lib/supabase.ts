import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function getUserMovie(userId: string, movieId: number) {
  const { data, error } = await supabase
    .from('user_movies')
    .select('*')
    .eq('user_id', userId)
    .eq('movie_id', movieId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw error;
  }

  return data;
}

export async function upsertUserMovie(
  userId: string,
  movieId: number,
  update: Partial<{
    rating: number | null;
    watched: boolean;
    watched_at: string | null;
  }>
) {
  const { error } = await supabase.from('user_movies').upsert({
    user_id: userId,
    movie_id: movieId,
    ...update,
  });

  if (error) throw error;
}

export async function deleteUserMovie(userId: string, movieId: number) {
  const { error } = await supabase
    .from('user_movies')
    .delete()
    .eq('user_id', userId)
    .eq('movie_id', movieId);

  if (error) throw error;
}