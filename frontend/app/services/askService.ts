const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1`;

export interface AskResponse {
  question: string;
  answer: string;
  source: Array<{
    document_id: string;
    location: {
      s3Location?: {
        uri: string;
      };
    };
    metadata: Record<string, unknown>;
    score: number;
  }>;
}

export interface AskRequest {
  question: string;
}

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };
}

/**
 * Ask a question about travel plans or destinations
 */
export async function askQuestion(question: string): Promise<AskResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }
      const error = await response.json();
      throw new Error(error.detail || `Failed to ask question: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
}
