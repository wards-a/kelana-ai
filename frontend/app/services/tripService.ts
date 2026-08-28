export interface Trip {
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

export interface TripsResponse {
  trips: Trip[];
  total: number;
}

const API_BASE_URL = "http://localhost:8000/api/v1";

/**
 * Fetch all trips from the backend
 */
export async function getAllTrips(): Promise<Trip[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trips: ${response.statusText}`);
    }

    const trips = await response.json();
    return trips;
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw error;
  }
}

/**
 * Fetch a specific trip by ID
 */
export async function getTripById(tripId: number): Promise<Trip> {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trip: ${response.statusText}`);
    }

    const trip = await response.json();
    return trip;
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
}
