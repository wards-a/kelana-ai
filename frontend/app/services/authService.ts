const API_BASE_URL = "http://localhost:8000/api/v1";

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  };
  data?: {
    access_token: string;
    token_type: string;
    user: {
      id: number;
      name: string;
      email: string;
      created_at: string;
    };
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Login user and get JWT token
 */
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const result = await response.json();
    
    // Save token to localStorage
    if (result.data?.access_token) {
      localStorage.setItem("token", result.data.access_token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user by removing token from localStorage
 */
export function logoutUser(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Get stored token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Get stored user info from localStorage
 */
export function getUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!getToken();
}

/**
 * Get authorization header with token
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
  total_trips: number;
}

/**
 * Get current user profile information
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const profile = await response.json();
    return profile;
  } catch (error) {
    throw error;
  }
}
