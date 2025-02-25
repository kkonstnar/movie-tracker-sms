import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MovieDetails from '../pages/MovieDetails';
import { tmdb } from '../lib/tmdb';
import { AuthProvider } from '../lib/AuthContext';
import { useAuth } from '../lib/AuthContext';
import { useUserMovie } from '../hooks/useUserMovie';

// Mock data
const mockMovie = {
  id: 123,
  title: 'Test Movie',
  overview: 'Test overview',
  poster_path: '/test.jpg',
  backdrop_path: '/test-backdrop.jpg',
  release_date: '2024-01-01',
  vote_average: 8.5,
  runtime: 120,
  tagline: 'Test tagline',
  genres: [{ id: 1, name: 'Action' }],
  credits: {
    cast: [
      {
        id: 1,
        name: 'Actor 1',
        character: 'Character 1',
        profile_path: '/actor1.jpg',
      },
    ],
    crew: [],
  },
  external_ids: {
    imdb_id: 'tt1234567',
  },
};

// Mock modules
vi.mock('../lib/tmdb', () => ({
  tmdb: {
    getMovieDetails: vi.fn().mockResolvedValue(mockMovie),
    getImageUrl: vi.fn((path) => path ? `https://image.tmdb.org/t/p/original${path}` : null),
    getImdbUrl: vi.fn((id) => `https://www.imdb.com/title/${id}`),
    getRecommendations: vi.fn().mockResolvedValue({ results: [] }),
    getSimilarMovies: vi.fn().mockResolvedValue({ results: [] }),
  },
}));

vi.mock('../hooks/useUserMovie', () => ({
  useUserMovie: vi.fn(() => ({
    userMovie: null,
    updateMovie: vi.fn(),
    removeMovie: vi.fn(),
    isAuthenticated: false,
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
  };
});

// Test setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
});

const renderMovieDetails = () => {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MovieDetails />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('MovieDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders loading state initially', () => {
    renderMovieDetails();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders movie details after loading', async () => {
    renderMovieDetails();

    await waitFor(() => {
      expect(screen.getByText(mockMovie.title)).toBeInTheDocument();
      expect(screen.getByText(mockMovie.overview)).toBeInTheDocument();
      expect(screen.getByText(mockMovie.tagline)).toBeInTheDocument();
      expect(screen.getByText(`${mockMovie.runtime} min`)).toBeInTheDocument();
    });
  });

  it('shows error state when movie fetch fails', async () => {
    vi.mocked(tmdb.getMovieDetails).mockRejectedValueOnce(new Error('Failed to fetch'));

    renderMovieDetails();

    await waitFor(() => {
      expect(screen.getByText(/movie not found/i)).toBeInTheDocument();
    });
  });

  it('displays movie metadata correctly', async () => {
    renderMovieDetails();

    await waitFor(() => {
      expect(screen.getByText(mockMovie.genres[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockMovie.vote_average.toFixed(1))).toBeInTheDocument();
      expect(screen.getByText(new Date(mockMovie.release_date).getFullYear().toString())).toBeInTheDocument();
    });
  });

  it('displays cast information', async () => {
    renderMovieDetails();

    await waitFor(() => {
      expect(screen.getByText(mockMovie.credits.cast[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockMovie.credits.cast[0].character)).toBeInTheDocument();
    });
  });

  it('includes IMDb link when available', async () => {
    renderMovieDetails();

    await waitFor(() => {
      const imdbLink = screen.getByText(/view on imdb/i);
      expect(imdbLink).toBeInTheDocument();
      expect(imdbLink.closest('a')).toHaveAttribute(
        'href',
        tmdb.getImdbUrl(mockMovie.external_ids.imdb_id)
      );
    });
  });

  it('allows authenticated users to rate movies', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      user: { id: 'test-user' },
      loading: false,
      signOut: vi.fn(),
    }));

    vi.mocked(useUserMovie).mockImplementation(() => ({
      userMovie: null,
      updateMovie: vi.fn(),
      removeMovie: vi.fn(),
      isAuthenticated: true,
    }));

    renderMovieDetails();

    await waitFor(() => {
      const ratingButtons = screen.getAllByRole('button', { name: /rate/i });
      expect(ratingButtons.length).toBeGreaterThan(0);
    });
  });
});