import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { User, Film, Star, Clock, Calendar, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { tmdb } from '../lib/tmdb';
import { cn } from '../lib/utils';
import { MovieRecommendations } from '../components/MovieRecommendations';

interface UserStats {
  totalWatched: number;
  averageRating: number;
  recentlyWatched: {
    movie_id: number;
    rating: number | null;
    watched_at: string | null;
  }[];
  watchlist: {
    movie_id: number;
  }[];
}

function MovieCard({ 
  id, 
  title, 
  posterPath, 
  rating, 
  date 
}: { 
  id: number; 
  title: string; 
  posterPath: string | null; 
  rating?: number;
  date?: string;
}) {
  const { data: movie } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => tmdb.getMovieDetails(id),
  });

  if (!movie) {
    return (
      <div className="aspect-[2/3] animate-pulse rounded-lg bg-[#1E293B]" />
    );
  }

  return (
    <Link
      to={`/movies/${id}`}
      className="group relative overflow-hidden rounded-lg bg-[#1E293B] transition-transform hover:scale-105"
    >
      <div className="aspect-[2/3]">
        {movie.poster_path ? (
          <img
            src={tmdb.getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-800">
            <span className="text-gray-400">{movie.title[0]}</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <h3 className="text-sm font-medium leading-tight">{movie.title}</h3>
        {rating && (
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400" />
            <span className="text-xs">{rating}</span>
          </div>
        )}
        {date && (
          <div className="mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-400">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function Profile() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const [
        { data: watched },
        { data: watchlist }
      ] = await Promise.all([
        // Get watched movies with ratings
        supabase
          .from('user_movies')
          .select('movie_id, rating, watched_at')
          .eq('user_id', user.id)
          .not('rating', 'is', null)
          .order('watched_at', { ascending: false }),

        // Get watchlist
        supabase
          .from('user_movies')
          .select('movie_id')
          .eq('user_id', user.id)
          .eq('watched', false),
      ]);

      if (!watched || !watchlist) {
        throw new Error('Failed to fetch user stats');
      }

      const totalWatched = watched.length;
      const ratings = watched.filter(m => m.rating !== null);
      const averageRating = ratings.length > 0
        ? ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length
        : 0;

      return {
        totalWatched,
        averageRating,
        recentlyWatched: watched.slice(0, 10),
        watchlist: watchlist.slice(0, 10),
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-400">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500 rounded-full">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.email}</h2>
            <p className="text-gray-400">
              Joined {new Date(user?.created_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Film className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-semibold">Movies Watched</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalWatched}</p>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-semibold">Average Rating</h3>
          </div>
          <p className="text-3xl font-bold">
            {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
          </p>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-semibold">This Month</h3>
          </div>
          <p className="text-3xl font-bold">
            {stats.recentlyWatched.filter(m => 
              m.watched_at && new Date(m.watched_at).getMonth() === new Date().getMonth()
            ).length}
          </p>
        </div>
      </div>

      {/* Recently Watched */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recently Watched</h3>
          <Link 
            to="/movies" 
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            View All
          </Link>
        </div>
        {stats.recentlyWatched.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stats.recentlyWatched.map((movie) => (
              <MovieCard
                key={movie.movie_id}
                id={movie.movie_id}
                title=""
                posterPath={null}
                rating={movie.rating || undefined}
                date={movie.watched_at || undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No movies watched yet</p>
        )}
      </div>

      {/* Watchlist */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-semibold">Watchlist</h3>
          </div>
          <Link 
            to="/movies" 
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Browse Movies
          </Link>
        </div>
        {stats.watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stats.watchlist.map((movie) => (
              <MovieCard
                key={movie.movie_id}
                id={movie.movie_id}
                title=""
                posterPath={null}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Your watchlist is empty</p>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Personalized For You</h3>
          <div className="text-sm text-gray-400">
            Based on your ratings and preferences
          </div>
        </div>
        <MovieRecommendations type="ai" />
      </div>
    </div>
  );
}

export default Profile;