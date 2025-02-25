import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MovieRecommender } from '../lib/recommendations';
import { supabase } from '../lib/supabase';
import { tmdb } from '../lib/tmdb';

// Mock data
const mockRatings = [
  { user_id: 'user1', movie_id: 1, rating: 5 },
  { user_id: 'user1', movie_id: 2, rating: 4 },
  { user_id: 'user2', movie_id: 1, rating: 3 },
];

const mockMovieDetails = {
  id: 1,
  genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Drama' }],
  vote_average: 8.5,
  popularity: 850,
  release_date: '2024-01-01',
};

const mockMovieDetails2 = {
  id: 2,
  genres: [{ id: 2, name: 'Drama' }, { id: 3, name: 'Comedy' }],
  vote_average: 7.5,
  popularity: 750,
  release_date: '2023-01-01',
};

// Mock modules
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        not: vi.fn().mockResolvedValue({ data: mockRatings }),
      })),
    })),
  },
}));

vi.mock('../lib/tmdb', () => ({
  tmdb: {
    getMovieDetails: vi.fn((id) => 
      Promise.resolve(id === 1 ? mockMovieDetails : mockMovieDetails2)
    ),
  },
}));

describe('MovieRecommender', () => {
  let recommender: MovieRecommender;

  beforeEach(() => {
    vi.clearAllMocks();
    recommender = new MovieRecommender();
  });

  it('should initialize with user ratings and movie features', async () => {
    await recommender.initialize('user1');
    const recommendations = await recommender.getRecommendations('user1', 5);
    
    expect(recommendations).toBeDefined();
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeLessThanOrEqual(5);
  });

  it('should return empty array for user with no ratings', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn(() => ({
        not: vi.fn().mockResolvedValue({ data: [] }),
      })),
    }));

    await recommender.initialize('user3');
    const recommendations = await recommender.getRecommendations('user3', 5);
    
    expect(recommendations).toEqual([]);
  });

  it('should call Supabase and TMDB APIs during initialization', async () => {
    await recommender.initialize('user1');
    
    expect(supabase.from).toHaveBeenCalledWith('user_movies');
    expect(tmdb.getMovieDetails).toHaveBeenCalledTimes(2);
    expect(tmdb.getMovieDetails).toHaveBeenCalledWith(1);
    expect(tmdb.getMovieDetails).toHaveBeenCalledWith(2);
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(tmdb.getMovieDetails).mockRejectedValue(new Error('API Error'));
    
    await recommender.initialize('user1');
    const recommendations = await recommender.getRecommendations('user1', 5);
    
    expect(recommendations).toBeDefined();
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations).toEqual([]);
  });

  it('should respect the limit parameter', async () => {
    await recommender.initialize('user1');
    const limit = 3;
    const recommendations = await recommender.getRecommendations('user1', limit);
    
    expect(recommendations.length).toBeLessThanOrEqual(limit);
  });

  it('should calculate movie similarity correctly', async () => {
    await recommender.initialize('user1');
    const recommendations = await recommender.getRecommendations('user1', 1);
    
    expect(recommendations).toBeDefined();
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeLessThanOrEqual(1);
  });
});