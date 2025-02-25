# MovieTracker

A full-featured movie tracking application built with React, TypeScript, and Supabase for SMS Developer assessment

## Features

- Track movies you've watched
- Rate and review movies
- Search by title, actors, directors, and genres
- View IMDb ratings
- Responsive design
- AI-powered movie recommendations
- Secure authentication
- Personal movie statistics

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase
- **State Management**: TanStack Query
- **Testing**: Vitest, Testing Library
- **AI**: Custom recommendation engine using collaborative filtering

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Connect to your Supabase project:

   - Go to [https://supabase.com](https://supabase.com) and sign in
   - Create a new project or select an existing one
   - From your project dashboard, go to Settings > Database to find your connection details
   - Save your project URL and anon/public key for the environment variables

2. Run the migrations from the `supabase/migrations` folder
3. Enable Row Level Security (RLS) policies

### Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run coverage

# Run tests in watch mode
npm run test -- --watch
```

### Test Structure

- `src/__tests__/`: Contains all test files
- `src/__tests__/setup.ts`: Global test setup and mocks
- Component tests use React Testing Library
- API tests mock Supabase responses
- Integration tests cover key user flows

## Project Structure

```
src/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and services
├── pages/            # Route components
└── __tests__/        # Test files

supabase/
└── migrations/       # Database migrations
```

## Key Components

### Authentication

- Email/password authentication
- Protected routes
- Session management

### Movie Management

- Search and filter movies
- Add to watchlist
- Rate and review
- Track watch history

### Recommendation System

The AI recommendation system uses:

- Collaborative filtering
- Content-based filtering
- User preference analysis
- Genre matching
- Rating patterns

## API Endpoints

### Movies

- `GET /movies`: List movies with pagination
- `GET /movies/:id`: Get movie details
- `GET /movies/search`: Search movies
- `GET /movies/recommendations`: Get personalized recommendations

### User Movies

- `POST /user-movies`: Add movie to user's list
- `PUT /user-movies/:id`: Update movie rating/status
- `DELETE /user-movies/:id`: Remove movie from list
