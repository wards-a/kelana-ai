"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TripCard from "@/components/tripCard";
import { Trip, getAllTrips } from "@/app/services/tripService";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

const ITEMS_PER_PAGE = 10;

type SortOption = "recent" | "oldest" | "budget-low" | "budget-high";

export default function TripsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllTrips();
        // Sort by most recent first
        const sortedData = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTrips(sortedData);
        setFilteredTrips(sortedData);
        setCurrentPage(1);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch trips"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Filter and sort trips
  useEffect(() => {
    let result = trips;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.destination.toLowerCase().includes(query) ||
          trip.travel_style.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        case "budget-low":
          return a.budget - b.budget;
        case "budget-high":
          return b.budget - a.budget;
        case "recent":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });

    setFilteredTrips(result);
    setCurrentPage(1);
  }, [searchQuery, sortBy, trips]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Generate page numbers for pagination buttons
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">KelanaAI</h1>
            <p className="text-gray-600 text-sm">Your AI-Powered Travel Planner</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold text-gray-800">{user.name}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Link href="/profile">
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200">
                  👤 Profile
                </button>
              </Link>
              <Link href="/">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200">
                  Plan New Trip
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Your Travel History
          </h2>
          <p className="text-gray-600">
            Browse all your previously planned trips and itineraries
          </p>
        </div>

        {/* Search and Sort Controls */}
        {!loading && !error && trips.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search by Destination or Travel Style
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="e.g., Tokyo, Family, Cultural..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Sort Dropdown */}
              <div>
                <label
                  htmlFor="sort"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="budget-low">Budget: Low to High</option>
                  <option value="budget-high">Budget: High to Low</option>
                </select>
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  Found <span className="font-semibold">{filteredTrips.length}</span> result{filteredTrips.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Loading your trips...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error loading trips</p>
            <p className="text-sm">{error}</p>
            {error.includes("not authenticated") && (
              <button 
                onClick={() => router.push("/login")}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {/* No Search Results State */}
        {!loading && !error && trips.length > 0 && filteredTrips.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 mb-6">
              No trips match your search criteria: "{searchQuery}". Try different keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSortBy("recent");
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && trips.length === 0 && (
          <div className="text-center py-16 space-y-8">
            <div className="space-y-4">
              <div className="text-7xl mb-6 inline-block">✈️</div>
              <h3 className="text-4xl font-bold text-gray-800">
                No Trips Yet
              </h3>
              <p className="text-lg text-gray-600">
                You haven't created any travel itineraries yet. Start your adventure today!
              </p>
            </div>

            {/* Helpful Information Card */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="text-left">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    How KelanaAI Works:
                  </h4>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl text-blue-600">📍</span>
                      <div>
                        <p className="font-semibold text-gray-800">Choose Your Destination</p>
                        <p className="text-gray-600 text-sm">Select any city or country you'd like to visit</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl text-blue-600">💰</span>
                      <div>
                        <p className="font-semibold text-gray-800">Set Your Budget</p>
                        <p className="text-gray-600 text-sm">Specify your total budget in USD</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl text-blue-600">📅</span>
                      <div>
                        <p className="font-semibold text-gray-800">Plan Duration</p>
                        <p className="text-gray-600 text-sm">Tell us how many days you want to travel</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl text-blue-600">🎯</span>
                      <div>
                        <p className="font-semibold text-gray-800">Select Travel Style</p>
                        <p className="text-gray-600 text-sm">Choose how you want to travel (solo, couple, family, etc.)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl text-blue-600">✨</span>
                      <div>
                        <p className="font-semibold text-gray-800">Get AI-Powered Itinerary</p>
                        <p className="text-gray-600 text-sm">Our AI generates a personalized day-by-day plan</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 text-lg inline-block">
                🚀 Create Your First Trip
              </button>
            </Link>

            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="bg-white rounded-lg p-6 shadow">
                <p className="text-3xl mb-2">🗺️</p>
                <h5 className="font-semibold text-gray-800 mb-2">Smart Planning</h5>
                <p className="text-sm text-gray-600">AI-powered recommendations tailored to your preferences</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <p className="text-3xl mb-2">💡</p>
                <h5 className="font-semibold text-gray-800 mb-2">Budget Friendly</h5>
                <p className="text-sm text-gray-600">Optimize your spending with daily budget breakdowns</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <p className="text-3xl mb-2">📝</p>
                <h5 className="font-semibold text-gray-800 mb-2">Easy Sharing</h5>
                <p className="text-sm text-gray-600">Copy and share your itineraries with friends and family</p>
              </div>
            </div>
          </div>
        )}

        {/* Trips Grid */}
        {!loading && !error && trips.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {currentTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4">
                {/* Page Info */}
                <p className="text-gray-600 text-sm">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredTrips.length)} of{" "}
                  {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
                </p>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    <div key={index}>
                      {page === "..." ? (
                        <span className="px-2 text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageClick(page as number)}
                          className={`px-3 py-2 rounded-lg font-medium transition ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-white font-semibold mb-4">About KelanaAI</h3>
              <p className="text-sm text-gray-400">
                Your AI-powered travel companion. Plan the perfect trip with
                personalized itineraries.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition">
                    Plan Trip
                  </Link>
                </li>
                <li>
                  <Link href="/trips" className="hover:text-white transition">
                    My Trips
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Travel Guides
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400">
              &copy; 2026 KelanaAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </ProtectedRoute>
  );
}
