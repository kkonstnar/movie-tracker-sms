import { Matrix } from 'ml-matrix';
import { euclidean } from 'ml-distance-euclidean';
import { supabase } from './supabase';
import { tmdb } from './tmdb';
import type { UserMovie } from './types';

interface MovieFeatures {
  id: number;
  genres: number[];
  voteAverage: number;
  popularity: number;
  releaseYear: number;
}

export class MovieRecommender {
  private userRatings: UserMovie[] = [];
  private movieFeatures: Map<number, MovieFeatures> = new Map();
  private similarityMatrix: Matrix | null = null;

  async initialize(userId: string) {
    // Fetch all user ratings
    const { data: ratings } = await supabase
      .from('user_movies')
      .select('*')
      .not('rating', 'is', null);

    if (ratings) {
      this.userRatings = ratings;
    }

    // Fetch movie features for rated movies
    const uniqueMovieIds = [...new Set(this.userRatings.map(r => r.movie_id))];
    await Promise.all(
      uniqueMovieIds.map(async (movieId) => {
        try {
          const movie = await tmdb.getMovieDetails(movieId);
          this.movieFeatures.set(movieId, {
            id: movieId,
            genres: movie.genres.map(g => g.id),
            voteAverage: movie.vote_average,
            popularity: movie.popularity,
            releaseYear: new Date(movie.release_date).getFullYear(),
          });
        } catch (error) {
          console.error(`Failed to fetch movie ${movieId}:`, error);
        }
      })
    );

    // Calculate similarity matrix
    this.calculateSimilarityMatrix();
  }

  private calculateSimilarityMatrix() {
    const movies = Array.from(this.movieFeatures.values());
    const n = movies.length;
    const matrix = new Matrix(n, n);

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        const similarity = this.calculateMovieSimilarity(
          movies[i],
          movies[j]
        );
        matrix.set(i, j, similarity);
        matrix.set(j, i, similarity);
      }
    }

    this.similarityMatrix = matrix;
  }

  private calculateMovieSimilarity(movie1: MovieFeatures, movie2: MovieFeatures): number {
    // Genre similarity (Jaccard similarity)
    const genreIntersection = movie1.genres.filter(g => movie2.genres.includes(g));
    const genreUnion = [...new Set([...movie1.genres, ...movie2.genres])];
    const genreSimilarity = genreIntersection.length / genreUnion.length;

    // Rating and popularity similarity (normalized Euclidean distance)
    const ratingPopVector1 = [
      movie1.voteAverage / 10,
      movie1.popularity / 1000,
      (movie1.releaseYear - 1900) / 200,
    ];
    const ratingPopVector2 = [
      movie2.voteAverage / 10,
      movie2.popularity / 1000,
      (movie2.releaseYear - 1900) / 200,
    ];
    const metricSimilarity = 1 / (1 + euclidean(ratingPopVector1, ratingPopVector2));

    // Weighted combination
    return 0.6 * genreSimilarity + 0.4 * metricSimilarity;
  }

  async getRecommendations(userId: string, limit = 10): Promise<number[]> {
    const userRatings = this.userRatings.filter(r => r.user_id === userId);
    if (!userRatings.length || !this.similarityMatrix) {
      return [];
    }

    const movies = Array.from(this.movieFeatures.values());
    const movieScores = new Map<number, number>();

    // Calculate recommendation scores using collaborative filtering
    for (const movie of movies) {
      if (userRatings.some(r => r.movie_id === movie.id)) {
        continue; // Skip movies the user has already rated
      }

      let score = 0;
      let totalSimilarity = 0;

      for (const rating of userRatings) {
        const ratedMovie = this.movieFeatures.get(rating.movie_id);
        if (!ratedMovie) continue;

        const similarity = this.calculateMovieSimilarity(movie, ratedMovie);
        score += similarity * (rating.rating || 0);
        totalSimilarity += similarity;
      }

      if (totalSimilarity > 0) {
        movieScores.set(movie.id, score / totalSimilarity);
      }
    }

    // Sort and return top recommendations
    return Array.from(movieScores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([movieId]) => movieId);
  }
}