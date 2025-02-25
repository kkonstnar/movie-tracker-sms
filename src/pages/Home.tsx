import React from 'react';
import { Film, Play, Plus, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full">
        {/* Hero Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=2070"
            alt="Hero backdrop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Track Your Movie Journey
              </h1>
              <p className="text-xl text-gray-300">
                Join millions of movie enthusiasts. Rate, review, and discover your next favorite film.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  <Play className="w-5 h-5" />
                  Get Started
                </Link>
                <Link
                  to="/movies"
                  className="flex items-center gap-2 px-8 py-4 bg-gray-800/80 rounded-lg font-semibold hover:bg-gray-700/80 transition"
                >
                  <Info className="w-5 h-5" />
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Why MovieTracker?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1E293B] rounded-2xl p-8 transform hover:scale-105 transition">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
              <Film className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Curated Collections</h3>
            <p className="text-gray-400">
              Discover handpicked movies across genres. From classic masterpieces to the latest blockbusters.
            </p>
          </div>

          <div className="bg-[#1E293B] rounded-2xl p-8 transform hover:scale-105 transition">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
              <Plus className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Personal Watchlist</h3>
            <p className="text-gray-400">
              Keep track of movies you want to watch. Never miss a film that catches your interest.
            </p>
          </div>

          <div className="bg-[#1E293B] rounded-2xl p-8 transform hover:scale-105 transition">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
              <Play className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Smart Recommendations</h3>
            <p className="text-gray-400">
              Get personalized movie suggestions based on your taste and watching history.
            </p>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Trending Now</h2>
          <Link
            to="/movies"
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: "Inception",
              year: "2010",
              image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800"
            },
            {
              title: "Interstellar",
              year: "2014",
              image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800"
            },
            {
              title: "The Dark Knight",
              year: "2008",
              image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800"
            },
            {
              title: "Pulp Fiction",
              year: "1994",
              image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800"
            }
          ].map((movie, index) => (
            <div
              key={index}
              className="bg-[#1E293B] rounded-lg overflow-hidden group cursor-pointer transform hover:scale-105 transition"
            >
              <div className="relative">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Play className="w-12 h-12" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{movie.title}</h3>
                <p className="text-sm text-gray-400">{movie.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-[#1E293B] rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Movie Journey?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join our community of movie lovers. Track your watches, rate your favorites, and discover new films.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            <Film className="w-5 h-5" />
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;