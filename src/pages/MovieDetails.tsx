import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, ArrowLeft, Bookmark, ExternalLink } from 'lucide-react';
import { tmdb } from '../lib/tmdb';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { MovieRecommendations } from '../components/MovieRecommendations';
import { RatingStars } from '../components/RatingStars';
import { useUserMovie } from '../hooks/useUserMovie';

function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const movieId = parseInt(id!, 10);

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => tmdb.getMovieDetails(movieId),
  });

  const {
    userMovie,
    updateMovie,
    isAuthenticated
  } = useUserMovie(movieId);

  const handleRating = (rating: number) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to rate movies');
      return;
    }
    updateMovie({ 
      rating,
      watched: true,
      watched_at: new Date().toISOString()
    });
  };

  const toggleWatchlist = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to use watchlist');
      return;
    }
    updateMovie({ watched: !userMovie?.watched });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-400">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/movies"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Movies
      </Link>

      {/* Hero Section */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        {movie.backdrop_path ? (
          <img
            src={tmdb.getImageUrl(movie.backdrop_path, 'backdrop')}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-800">
            <span className="text-gray-400">No backdrop available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent" />
      </div>

      {/* Movie Info */}
      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        {/* Poster */}
        <div className="space-y-4">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
            {movie.poster_path ? (
              <img
                src={tmdb.getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-800">
                <span className="text-gray-400">No poster available</span>
              </div>
            )}
          </div>

          <button
            onClick={toggleWatchlist}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors",
              userMovie?.watched
                ? "bg-indigo-500 hover:bg-indigo-600"
                : "bg-[#1E293B] hover:bg-[#2E3B4B]"
            )}
          >
            <Bookmark className="h-4 w-4" />
            {userMovie?.watched ? 'In Watchlist' : 'Add to Watchlist'}
          </button>

          {movie.external_ids.imdb_id && (
            <a
              href={tmdb.getImdbUrl(movie.external_ids.imdb_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#1E293B] hover:bg-[#2E3B4B] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on IMDb
            </a>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">{movie.title}</h1>
            {movie.tagline && (
              <p className="mt-2 text-xl text-gray-400">{movie.tagline}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <RatingStars
                value={movie.vote_average / 2}
                onChange={() => {}}
                readonly
                size="sm"
              />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span>{movie.runtime} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre.id}
                className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-400"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <p className="text-gray-300">{movie.overview}</p>

          {/* User Rating */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Your Rating</h3>
            <div className="flex items-center gap-4">
              <RatingStars
                value={userMovie?.rating || null}
                onChange={handleRating}
                size="lg"
              />
              {userMovie?.rating && (
                <button
                  onClick={() => updateMovie({ rating: null })}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Clear rating
                </button>
              )}
            </div>
            {!isAuthenticated && (
              <p className="text-sm text-gray-400">
                Please <Link to="/auth" className="text-indigo-400 hover:text-indigo-300">sign in</Link> to rate this movie
              </p>
            )}
          </div>

          {/* Cast */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Top Cast</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {movie.credits.cast.slice(0, 8).map((actor) => (
                <div key={actor.id} className="text-center">
                  <div className="mx-auto mb-2 h-24 w-24 overflow-hidden rounded-full">
                    {actor.profile_path ? (
                      <img
                        src={tmdb.getImageUrl(actor.profile_path)}
                        alt={actor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-700">
                        <span className="text-2xl">{actor.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <p className="font-medium">{actor.name}</p>
                  <p className="text-sm text-gray-400">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <MovieRecommendations movieId={movie.id} type="recommendations" />

          {/* Similar Movies */}
          <MovieRecommendations movieId={movie.id} type="similar" />
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;