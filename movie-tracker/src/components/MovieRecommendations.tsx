import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { tmdb, type Movie } from '../lib/tmdb';
import { MovieRecommender } from '../lib/recommendations';
import { useAuth } from '../lib/AuthContext';

interface MovieRecommendationsProps {
  movieId?: number;
  type: 'recommendations' | 'similar' | 'ai';
}

export function MovieRecommendations({ movieId, type }: MovieRecommendationsProps) {
  const { user } = useAuth();

  const { data: movies, isLoading } = useQuery({
    queryKey: [type, movieId, user?.id],
    queryFn: async () => {
      if (type === 'ai' && user) {
        const recommender = new MovieRecommender();
        await recommender.initialize(user.id);
        const recommendedIds = await recommender.getRecommendations(user.id, 5);
        
        // Fetch full movie details for recommendations
        const movieDetails = await Promise.all(
          recommendedIds.map(id => tmdb.getMovieDetails(id))
        );
        
        return { results: movieDetails };
      } else if (movieId) {
        return type === 'recommendations' 
          ? tmdb.getRecommendations(movieId)
          : tmdb.getSimilarMovies(movieId);
      }
      return { results: [] };
    },
    enabled: type === 'ai' ? !!user : !!movieId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-lg bg-[#1E293B]"
          />
        ))}
      </div>
    );
  }

  if (!movies?.results.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">
        {type === 'recommendations' 
          ? 'Recommended Movies' 
          : type === 'similar'
          ? 'Similar Movies'
          : 'Personalized Recommendations'}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.results.slice(0, 5).map((movie) => (
          <Link
            key={movie.id}
            to={`/movies/${movie.id}`}
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
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}