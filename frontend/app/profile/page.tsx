"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserProfile, UserProfile } from "@/app/services/authService";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const formattedDate = profile
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/">
              <h1 className="text-3xl font-bold text-blue-600 cursor-pointer hover:text-blue-700">
                KelanaAI
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome,</p>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Link href="/">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200">
                    Home
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
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              My Profile
            </h2>
            <p className="text-gray-600">
              View your account information and travel statistics
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
              <p className="font-semibold">Error loading profile</p>
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

          {/* Profile Content */}
          {!loading && !error && profile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Avatar and Basic Info */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center sticky top-20">
                  {/* Avatar */}
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <span className="text-5xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {profile.name}
                  </h3>

                  {/* Member Since */}
                  <p className="text-gray-600 text-sm mb-6">
                    Member since {formattedDate}
                  </p>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <Link href="/trips" className="block">
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200">
                        My Trips
                      </button>
                    </Link>
                    <Link href="/" className="block">
                      <button className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200">
                        Plan New Trip
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column - Detailed Profile Information */}
              <div className="lg:col-span-2 space-y-8">
                {/* Account Information Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="text-3xl mr-3">👤</span>
                    Account Information
                  </h3>

                  <div className="space-y-6">
                    {/* Email */}
                    <div className="pb-6 border-b border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">✉️</span>
                        <p className="text-lg text-gray-800 break-all">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📅</span>
                        <p className="text-lg text-gray-800">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travel Statistics Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="text-3xl mr-3">✈️</span>
                    Travel Statistics
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Total Trips */}
                    <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                      <p className="text-blue-500 text-sm font-semibold mb-2 uppercase tracking-wide">
                        Total Trips Planned
                      </p>
                      <p className="text-blue-400 text-5xl font-bold">
                        {profile.total_trips}
                      </p>
                      <p className="text-blue-500 text-sm mt-2">
                        {profile.total_trips === 1 ? "destination" : "destinations"} explored
                      </p>
                    </div>

                    {/* Profile Completion */}
                    {/* <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                      <p className="text-blue-500 text-sm font-semibold mb-2 uppercase tracking-wide">
                        Profile Status
                      </p>
                      <p className="text-blue-400 text-5xl font-bold">100%</p>
                      <p className="text-blue-100 text-sm mt-2">
                        Complete profile
                      </p>
                    </div> */}
                  </div>

                  {/* Action based on trip count */}
                  <div className="mt-6 pt-6 border-t border-blue-400">
                    {profile.total_trips === 0 ? (
                      <div className="text-center">
                        <p className="text-blue-100 mb-4">
                          Start your travel journey by planning your first trip!
                        </p>
                        <Link href="/">
                          <button className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-200">
                            Create Your First Trip
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-blue-100">
                          Keep exploring! Plan your next adventure.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
                  Your AI-powered travel companion. Plan the perfect trip with personalized itineraries.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/" className="hover:text-white transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/trips" className="hover:text-white transition">
                      My Trips
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="hover:text-white transition">
                      Profile
                    </Link>
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
