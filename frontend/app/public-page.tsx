"use client";

import Link from "next/link";

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-blue-600">KelanaAI</h1>
          <p className="text-gray-600 text-sm">Your AI-Powered Travel Planner</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-center">
          <div className="text-7xl mb-6">✈️</div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Plan Your Perfect Trip
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover personalized travel itineraries powered by AI. Let KelanaAI help you plan your next adventure.
          </p>

          <div className="space-y-4">
            <p className="text-gray-600">Get started by signing in or creating an account</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="px-8 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold border-2 border-blue-600 rounded-lg transition duration-200">
                  Create Account
                </button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Get personalized recommendations based on your preferences</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Budget Tracking</h3>
              <p className="text-gray-600">Keep track of your spending with daily budget breakdowns</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Time Saving</h3>
              <p className="text-gray-600">Get a complete itinerary in seconds, not hours</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; 2026 KelanaAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
