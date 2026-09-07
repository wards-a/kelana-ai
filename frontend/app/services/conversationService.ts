const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1`;

export interface Message {
  id?: number;
  role: string;
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  messages: Message[];
  message_count?: number;
}

export interface SaveConversationRequest {
  title: string;
  messages: Message[];
}

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Save a conversation with messages
 */
export async function saveConversation(
  title: string,
  messages: Message[]
): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, messages }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }
      const error = await response.json();
      throw new Error(error.detail || `Failed to save conversation: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error saving conversation:", error);
    throw error;
  }
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<Conversation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

/**
 * Get a specific conversation with all messages
 */
export async function getConversation(conversationId: number): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to view this conversation.");
      }
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to delete this conversation.");
      }
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: number,
  newTitle: string
): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title: newTitle }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to edit this conversation.");
      }
      throw new Error(`Failed to update conversation: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
}
