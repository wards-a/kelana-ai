"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Trip, getTripById } from "@/app/services/tripService";
import { getCategoryBadgeStyle } from "@/lib/categoryStyles";
import { getCountryFlag } from "@/lib/countryFlags";
import { formatBudget } from "@/lib/formatters";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";


export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTripById(parseInt(tripId));
        setTrip(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch trip details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  const formattedDate = trip
    ? new Date(trip.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/trips">
            <span className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700">
              ← Back to Trips
            </span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600">KelanaAI</h1>
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
              <Link href="/ask">
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200">
                  💬 Ask AI
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
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Loading trip details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error loading trip</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Trip Details */}
        {!loading && !error && trip && (
          <div className="space-y-8">
            {/* Trip Header */}
            {(() => {
              const badgeStyle = getCategoryBadgeStyle(trip.category);
              return (
                <div
                  className={`bg-gradient-to-r ${badgeStyle.headerGradient} rounded-lg shadow-lg p-8 text-white`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-6xl">{getCountryFlag(trip.destination)}</span>
                      <div>
                        <h1 className="text-4xl font-bold mb-2">{trip.destination}</h1>
                        <p className="text-opacity-90 text-white">
                          Created on {formattedDate}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`inline-block px-4 py-2 ${badgeStyle.bgColor} ${badgeStyle.textColor} font-bold rounded-lg h-fit`}
                    >
                      {trip.category}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Trip Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Duration
                </p>
                <p className="text-2xl font-bold text-blue-600">{trip.days}</p>
                <p className="text-gray-500 text-xs">days</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total Budget
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatBudget(trip.budget)}
                </p>
                <p className="text-gray-500 text-xs">USD</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Daily Budget
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatBudget(trip.daily_budget)}
                </p>
                <p className="text-gray-500 text-xs">per day</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Travel Style
                </p>
                <p className="text-lg font-bold text-blue-600 capitalize">
                  {trip.travel_style}
                </p>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-blue-600 mr-3">✨</span>
                AI-Powered Itinerary
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 text-gray-700 prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-800 prose-em:text-gray-600 prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:text-orange-600">
                <ReactMarkdown>
                  {trip.ai_recommendation}
                </ReactMarkdown>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trip.ai_recommendation);
                  alert("Itinerary copied to clipboard!");
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Copy Itinerary
              </button>
              <Link href="/trips" className="flex-1">
                <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200">
                  Back to Trips
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
