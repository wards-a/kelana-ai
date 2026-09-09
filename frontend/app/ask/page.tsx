"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { askQuestion, AskResponse } from "@/app/services/askService";
import { saveConversation, getConversations, updateConversationTitle, getConversation } from "@/app/services/conversationService";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import ReactMarkdown from "react-markdown";


interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  response?: AskResponse;
  timestamp: Date;
}

interface SavedConversation {
  id: number;
  title: string;
  created_at: string;
}

export default function AskPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingConversation, setSavingConversation] = useState(false);
  const [conversationSaved, setConversationSaved] = useState(false);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState<string>("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll detection to show/hide scroll button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollButton(!isNearBottom && messages.length > 3);
  };

  // Load saved conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const conversations = await getConversations();
      setSavedConversations(conversations);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

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

  const handleSaveConversation = async () => {
    if (messages.length === 0) {
      setError("No messages to save");
      return;
    }

    setSavingConversation(true);
    setError(null);

    try {
      // Generate title from first user message
      const firstUserMessage = messages.find((m) => m.type === "user");
      const title = firstUserMessage 
        ? firstUserMessage.content.substring(0, 100) 
        : "Travel Conversation";

      // Convert messages to API format
      const conversationMessages = messages.map((msg) => ({
        role: msg.type,
        content: msg.content,
      }));

      await saveConversation(title, conversationMessages);
      setConversationSaved(true);

      // Reload conversations list
      await loadConversations();

      // Show success message for 3 seconds
      setTimeout(() => {
        setConversationSaved(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save conversation");
    } finally {
      setSavingConversation(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setConversationSaved(false);
    setCurrentConversationId(null);
    setCurrentConversationTitle("");
  };

  const handleLoadConversation = async (conv: SavedConversation) => {
    setLoadingHistory(true);
    setError(null);
    
    try {
      const conversation = await getConversation(conv.id);
      
      // Convert API messages to UI Message format
      const loadedMessages: Message[] = conversation.messages.map((msg: any) => ({
        id: `${msg.role}-${msg.id}`,
        type: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));
      
      setMessages(loadedMessages);
      setCurrentConversationId(conv.id);
      setCurrentConversationTitle(conv.title);
      setConversationSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEditConversation = (conv: SavedConversation) => {
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveTitle = async (convId: number) => {
    if (!editingTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }

    try {
      await updateConversationTitle(convId, editingTitle);
      // Update local state
      setSavedConversations(prev =>
        prev.map(conv =>
          conv.id === convId ? { ...conv, title: editingTitle } : conv
        )
      );
      // Update current conversation title if editing the active conversation
      if (currentConversationId === convId) {
        setCurrentConversationTitle(editingTitle);
      }
      setEditingConvId(null);
      setEditingTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update title");
    }
  };

  const handleCancelEdit = () => {
    setEditingConvId(null);
    setEditingTitle("");
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

        {/* Main Content with Sidebar */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
          {/* Left Sidebar - Saved Conversations */}
          <aside className="w-64 bg-white rounded-lg shadow-lg p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">💬 Conversations</h2>
            
            {loadingConversations ? (
              <div className="text-center text-gray-500 text-sm">Loading...</div>
            ) : savedConversations.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">No saved conversations yet</div>
            ) : (
              <ul className="space-y-2">
                {savedConversations.map((conv) => (
                  <li key={conv.id} className="group">
                    {editingConvId === conv.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveTitle(conv.id)}
                            className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white text-xs rounded transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLoadConversation(conv)}
                          className={`flex-1 text-left px-3 py-2 rounded-lg transition text-sm truncate ${
                            currentConversationId === conv.id
                              ? "bg-blue-100 text-blue-700 font-semibold"
                              : "bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
                          }`}
                          title={conv.title}
                        >
                          {conv.title}
                        </button>
                        <button
                          onClick={() => handleEditConversation(conv)}
                          className="opacity-0 group-hover:opacity-100 px-2 py-2 text-gray-500 hover:text-blue-600 transition"
                          title="Edit title"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Chat Container */}
          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
            {/* Conversation Title Header */}
            {currentConversationTitle && (
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 truncate" title={currentConversationTitle}>
                  {currentConversationTitle}
                </h3>
              </div>
            )}
            
            {/* Chat Messages */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-4 relative"
            >
              {loadingHistory ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-500">Loading conversation...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
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
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
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
                        {/* Timestamp */}
                        <div className={`text-xs mt-2 ${
                          message.type === "user" 
                            ? "text-blue-200" 
                            : "text-gray-500"
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-md lg:max-w-xl px-4 py-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-sm text-gray-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}

              {/* Scroll to Bottom Button */}
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="fixed bottom-32 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10 hover:scale-110"
                  title="Scroll to latest message"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {/* Success Message */}
              {conversationSaved && (
                <div className="mb-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                  💾 Conversation saved successfully!
                </div>
              )}

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
                  className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : "Send"}
                </button>
              </form>

              {/* Action Buttons */}
              {messages.length > 0 && (
                <div className="mt-3 flex gap-3">
                  {!currentConversationId && (
                    <button
                      onClick={handleSaveConversation}
                      disabled={savingConversation || conversationSaved}
                      className="text-sm px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded transition disabled:cursor-not-allowed"
                    >
                      {savingConversation ? "Saving..." : conversationSaved ? "✓ Saved" : "💾 Save Conversation"}
                    </button>
                  )}
                  <button
                    onClick={handleClearChat}
                    className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition"
                  >
                    {currentConversationId ? "✨ New Conversation" : "Clear chat"}
                  </button>
                </div>
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
