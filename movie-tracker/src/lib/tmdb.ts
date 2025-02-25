const TMDB_API_KEY = '449d62db69672aeafaa9512ff3b34b26';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NDlkNjJkYjY5NjcyYWVhZmFhOTUxMmZmM2IzNGIyNiIsIm5iZiI6MTc0MDQ2MjU1My4zOTgwMDAyLCJzdWIiOiI2N2JkNTlkOWY0MDJkZWY3MTIyZGFlMTQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.oGrCQcHMERI6gfphxZ1ca0yMurbvYwbkl7XdRFwk4qg';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  tagline: string;
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
  external_ids: {
    imdb_id: string;
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

const tmdbFetch = async (endpoint: string, params: Record<string, string> = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${TMDB_BASE_URL}${endpoint}${queryParams ? '?' + queryParams : ''}`;

  try {
    console.log(`Fetching TMDB API: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('TMDB API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`TMDB API Success:`, {
      endpoint,
      resultCount: data.results?.length,
    });
    return data;
  } catch (error) {
    console.error('TMDB API Request Failed:', error);
    throw error;
  }
};

export const tmdb = {
  getPopularMovies: async (page = 1): Promise<MovieResponse> => {
    return tmdbFetch('/movie/popular', { page: page.toString() });
  },

  searchMovies: async (query: string, page = 1): Promise<MovieResponse> => {
    return tmdbFetch('/search/movie', { query, page: page.toString() });
  },

  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    return tmdbFetch(`/movie/${movieId}`, { 
      append_to_response: 'credits,external_ids' 
    });
  },

  getMoviesByGenre: async (genreId: number, page = 1): Promise<MovieResponse> => {
    return tmdbFetch('/discover/movie', {
      with_genres: genreId.toString(),
      page: page.toString(),
    });
  },

  getMoviesByPerson: async (personId: number, page = 1): Promise<MovieResponse> => {
    return tmdbFetch('/discover/movie', {
      with_people: personId.toString(),
      page: page.toString(),
    });
  },

  searchPeople: async (query: string): Promise<{ results: Person[] }> => {
    return tmdbFetch('/search/person', { query });
  },

  getGenres: async (): Promise<{ genres: Genre[] }> => {
    return tmdbFetch('/genre/movie/list');
  },

  getRecommendations: async (movieId: number): Promise<MovieResponse> => {
    return tmdbFetch(`/movie/${movieId}/recommendations`);
  },

  getSimilarMovies: async (movieId: number): Promise<MovieResponse> => {
    return tmdbFetch(`/movie/${movieId}/similar`);
  },

  getImageUrl: (path: string | null, size: 'poster' | 'backdrop' = 'poster') => {
    if (!path) return null;
    const baseUrl = 'https://image.tmdb.org/t/p';
    const sizes = {
      poster: 'w500',
      backdrop: 'original',
    };
    return `${baseUrl}/${sizes[size]}${path}`;
  },

  getImdbUrl: (imdbId: string) => {
    return `https://www.imdb.com/title/${imdbId}`;
  },
};