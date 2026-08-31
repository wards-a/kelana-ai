"use client";

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatBudget } from "@/lib/formatters";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

interface TripResponse {
  id: number;
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
  category: string;
  daily_budget: number;
  ai_recommendation: string;
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    days: "",
    travel_style: "Solo",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tripData, setTripData] = useState<TripResponse | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate inputs
      if (!formData.destination.trim()) {
        throw new Error("Destination is required");
      }
      if (!formData.budget || parseFloat(formData.budget) <= 0) {
        throw new Error("Budget must be greater than 0");
      }
      if (!formData.days || parseInt(formData.days) <= 0) {
        throw new Error("Days must be greater than 0");
      }

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination: formData.destination,
          budget: parseFloat(formData.budget),
          days: parseInt(formData.days),
          travel_style: formData.travel_style,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("You are not authenticated. Please log in again.");
        }
        throw new Error(`Failed to create trip: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Trip created successfully:", result);

      setTripData(result);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTripData(null);
    setFormData({
      destination: "",
      budget: "",
      days: "",
      travel_style: "adventure",
    });
  };

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
              <Link href="/trips">
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200">
                  My Trips
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
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Show recommendation view if trip data exists */}
        {tripData ? (
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Planning
            </button>

            {/* Trip Summary Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Your Trip to {tripData.destination}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-blue-100 text-sm">Duration</p>
                  <p className="text-2xl font-bold">{tripData.days} Days</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Total Budget</p>
                  <p className="text-2xl font-bold">{formatBudget(tripData.budget)}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Daily Budget</p>
                  <p className="text-2xl font-bold">{formatBudget(tripData.daily_budget)}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Category</p>
                  <p className="text-2xl font-bold">{tripData.category}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-400">
                <p className="text-blue-100 text-sm">Travel Style</p>
                <p className="text-lg font-semibold capitalize">{tripData.travel_style}</p>
              </div>
            </div>

            {/* AI Recommendation Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-blue-600 mr-3">✨</span>
                AI-Powered Itinerary
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 text-gray-700 prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-800 prose-em:text-gray-600">
                <div className="prose lg:prose-xl dark:prose-invert">
                  <ReactMarkdown>
                    {tripData.ai_recommendation}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetForm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Plan Another Trip
              </button>
              <button
                onClick={() => {
                  // Copy recommendation to clipboard
                  navigator.clipboard.writeText(tripData.ai_recommendation);
                  alert("Recommendation copied to clipboard!");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Copy Itinerary
              </button>
            </div>
          </div>
        ) : (
          /* Show form view */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hero Image Section */}
            <div className="flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full h-96 sm:h-[28rem] lg:h-[32rem] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop"
                  alt="Travel Adventure"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>

            {/* Form Section */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Plan Your Journey
                </h2>

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    Trip created successfully! Check your itinerary.
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p className="font-semibold mb-2">{error}</p>
                    {error.includes("not authenticated") && (
                      <Link href="/login">
                        <button className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition duration-200 text-sm">
                          Go to Login
                        </button>
                      </Link>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Destination Field */}
                  <div>
                    <label
                      htmlFor="destination"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Destination
                    </label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Enter destination (e.g., Tokyo, Paris)"
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  {/* Budget Field */}
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Budget (USD)
                    </label>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="Enter your budget"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  {/* Days Field */}
                  <div>
                    <label
                      htmlFor="days"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Number of Days
                    </label>
                    <input
                      type="number"
                      id="days"
                      name="days"
                      value={formData.days}
                      onChange={handleInputChange}
                      placeholder="Enter number of days"
                      min="1"
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  {/* Travel Style Field */}
                  <div>
                    <label
                      htmlFor="travel_style"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Travel Style
                    </label>
                    <select
                      id="travel_style"
                      name="travel_style"
                      value={formData.travel_style}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      {/* <option value="adventure">Adventure</option>
                      <option value="luxury">Luxury</option>
                      <option value="budget">Budget</option>
                      <option value="cultural">Cultural</option>
                      <option value="relaxation">Relaxation</option> */}
                      <option value="solo">Solo</option>
                      <option value="couple">Couple</option>
                      <option value="family">Family</option>
                      {/* <option value="business">Business</option>
                      <option value="honeymoon">Honeymoon</option> */}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Trip..." : "Get AI Recommendation"}
                  </button>
                </form>

                <p className="text-sm text-gray-600 mt-4">
                  Our AI will generate a personalized itinerary based on your preferences.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Animation - Displayed during API request */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex flex-col items-center">
                {/* Animated Spinner */}
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Creating Your Itinerary
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Our AI is planning your perfect trip...
                </p>

                {/* Animated Dots */}
                <div className="flex justify-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
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
                  <a href="/trips" className="hover:text-white transition">
                    Destinations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Travel Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Budget Tips
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
                <li>
                  <a href="#" className="hover:text-white transition">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                &copy; 2026 KelanaAI. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M20 10a10 10 0 11-20 0 10 10 0 0120 0zm-8.9-4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </ProtectedRoute>
  );
}
