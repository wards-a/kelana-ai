from fastapi import FastAPI
from pydantic import BaseModel

class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    travel_style:   str

app = FastAPI()

# a GET endpoint at the root path
@app.get("/")
def home():
    return{
        "message" : "Welcome to KelanaAI"
    }

from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_recommendation_places,
    get_transportation_recommendation,
    get_travel_season,
)

# GET endpoint - used by hosting platforms
@app.get("/health")
def get_health_check():
    return {
        "status" : "OK"
    }

# GET endpoint - returns all valid trip categories
@app.get("/api/v1/trip-categories")
def get_trip_categories():
    trip_categories = ["Backpacker", "Standard", "Luxury"]
    return trip_categories

# GET endpoint - return recommended places
@app.get("/api/v1/recommendations")
def get_recommended_places():
    recommended_places = ["Tokyo Tower", "Mount Fuji", "Shibuya"]
    return recommended_places

# GET endpoint - return recommended transportations
@app.get("/api/v1/transportations")
def get_recommended_transportations():
    recommended_transportations = ["Bus", "Train", "Flight"]
    return recommended_transportations

# POST endpoint - receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    return {
        "destination" : request.destination,
        "budget" : request.budget,
        "daily_budget" : daily_budget,
        "category" : category,
        "recommendation_transport" : "Train",
    }

# def print_destinations(destinations):
#     print("Your Destinations")

#     index = 0
#     while index < len(destinations):
#         print(f"{index +1}. {destinations[index]}")
#         index += 1

# def print_recommended_places(destinations):
#     print("Recommended Places")

#     for destination in destinations:
#         print(destination)

#         for place in get_recommendation_places(destination):
#             print(f"- {place}")
        
#         print()

# def print_trip_summary(destination, days, budget, travel_month):
#     daily_budget = calculate_daily_budget(budget, days)
#     category = get_trip_category(budget)
#     transportation = get_transportation_recommendation(category)
#     season = get_travel_season(travel_month)

#     print()
#     print("========================")
#     print("KelanaAI")
#     print("========================")
#     print()
#     print_destinations(destination)
#     # print(f"Country         = {country}")
#     print()
#     print(f"Days            = {days}")
#     print(f"Budget          = {budget} USD")
#     print(f"Category        = {category}")
#     print(f"Daily Budget    = {daily_budget:.0f} USD/Day")
#     # print(f"Currency        = {currency}")
#     print(f"Travel Month    = {travel_month}")
#     print(f"Season          = {season}")
#     print(f"Recommended Transportation: {transportation}")
#     print()
#     print_recommended_places(destination)


# destinations = []

# while True:
#     place = input("Enter a destination (or type 'selesai' to finish): ")

#     # Check if the user wants to exit
#     if place.lower() == 'selesai':
#         break # This exits the loop immediately

#     destinations.append(place)


# print("Your full trip itienary:", destinations)

# # country = input("Country : ")
# days = int(input("Days : "))
# budget = float(input("Budget : "))
#     # currency = input("Currency : ")
# travel_month = input("Travel Month : ")

# print_trip_summary(destinations, days, budget, travel_month)

