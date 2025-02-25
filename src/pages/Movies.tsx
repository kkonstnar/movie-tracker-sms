import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Search, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { tmdb, type Movie } from '../lib/tmdb';
import { cn } from '../lib/utils';
import { MovieFilters } from '../components/MovieFilters';

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group relative overflow-hidden rounded-xl bg-[#1E293B] transition-transform hover:scale-105"
    >
      <div className="aspect-[2/3] w-full">
        {movie.poster_path ? (
          <img
            src={tmdb.getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-800">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <h3 className="text-lg font-semibold leading-tight">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
          <span className="text-sm text-gray-400">
            {new Date(movie.release_date).getFullYear()}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) {
        setSearchParams({ search: searchQuery });
      } else {
        setSearchParams({});
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  const fetchMovies = async ({ pageParam = 1 }) => {
    if (selectedPerson) {
      return tmdb.getMoviesByPerson(selectedPerson, pageParam);
    }
    if (selectedGenre) {
      return tmdb.getMoviesByGenre(selectedGenre, pageParam);
    }
    if (debouncedQuery) {
      return tmdb.searchMovies(debouncedQuery, pageParam);
    }
    return tmdb.getPopularMovies(pageParam);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['movies', debouncedQuery, selectedGenre, selectedPerson],
    queryFn: fetchMovies,
    getNextPageParam: (lastPage) => 
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageSize: 20,
  });

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  // Create a Set to track unique movie IDs
  const uniqueMovies = new Map<number, Movie>();
  data?.pages.forEach(page => {
    page.results.forEach(movie => {
      if (!uniqueMovies.has(movie.id)) {
        uniqueMovies.set(movie.id, movie);
      }
    });
  });
  const movies = Array.from(uniqueMovies.values());

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">
            {selectedPerson
              ? 'Movies by Person'
              : selectedGenre
              ? 'Movies by Genre'
              : debouncedQuery
              ? `Search Results for "${debouncedQuery}"`
              : 'Popular Movies'}
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedGenre(null);
                setSelectedPerson(null);
              }}
              className={cn(
                "w-full sm:w-80 bg-[#1E293B] rounded-lg pl-10 pr-4 py-2",
                "text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500"
              )}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <MovieFilters
          onGenreChange={(genreId) => {
            setSelectedGenre(genreId);
            setSelectedPerson(null);
            setSearchQuery('');
            setSearchParams({});
          }}
          onPersonChange={(personId) => {
            setSelectedPerson(personId);
            setSelectedGenre(null);
            setSearchQuery('');
            setSearchParams({});
          }}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-xl bg-[#1E293B]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-[#1E293B]">
          <p className="text-red-400">Error loading movies: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
            ))}
          </div>
          
          <div
            ref={loadMoreRef}
            className="flex justify-center py-8"
          >
            {isFetchingNextPage ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            ) : hasNextPage ? (
              <p className="text-gray-400">Loading more movies...</p>
            ) : (
              <p className="text-gray-400">No more movies to load</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl bg-[#1E293B]">
          <p className="text-gray-400">No movies found</p>
        </div>
      )}
    </div>
  );
}

export default Movies;