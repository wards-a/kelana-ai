"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { askQuestion, AskResponse } from "@/app/services/askService";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  response?: AskResponse;
  timestamp: Date;
}

export default function AskPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);
    setError(null);

    try {
      const response = await askQuestion(inputValue);

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.answer,
        response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get response";
      setError(errorMessage);

      // Add error message
      const errorAssistantMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

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
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          {/* Chat Container */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full max-h-[calc(100vh-200px)]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Ask KelanaAI
                  </h2>
                  <p className="text-gray-600 max-w-lg">
                    Ask questions about travel destinations, trip planning, budgets, travel styles, and more. Our AI is here to help you plan the perfect journey!
                  </p>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                    <button
                      onClick={() => setInputValue("What are the best budget-friendly destinations?")}
                      className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
                    >
                      Budget destinations
                    </button>
                    <button
                      onClick={() => setInputValue("What's a good 7-day trip itinerary for Tokyo?")}
                      className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
                    >
                      Tokyo itinerary
                    </button>
                    <button
                      onClick={() => setInputValue("Best time to visit Bali?")}
                      className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
                    >
                      Bali travel time
                    </button>
                    <button
                      onClick={() => setInputValue("How much budget do I need for a family trip?")}
                      className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
                    >
                      Family trip budget
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-md lg:max-w-xl px-4 py-3 rounded-lg ${
                          message.type === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        {message.response?.source && message.response.source.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300 text-xs opacity-75">
                            <p className="font-semibold mb-1">📚 Sources:</p>
                            <ul className="space-y-1">
                              {message.response.source.map((source, idx) => (
                                <li key={idx}>
                                  {source.location?.s3Location?.uri ? (
                                    <a
                                      href={source.location.s3Location.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline"
                                    >
                                      Source {idx + 1}
                                    </a>
                                  ) : (
                                    <span>Source {idx + 1}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {error && (
                <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about travel destinations, trip planning, budgets..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : "Send"}
                </button>
              </form>

              {/* Clear Button */}
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="mt-3 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  Clear chat
                </button>
              )}
            </div>
          </div>
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
                    <Link href="/ask" className="hover:text-white transition">
                      Ask AI
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
