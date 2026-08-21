from fastapi import FastAPI
from pydantic import BaseModel
from models.trip import Trip
from database import SessionLocal, init_db

app = FastAPI()

init_db()

class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    travel_style:   str

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

# GET all trips
@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

# GET ones spesific trips by trip_id
@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    
    return trip

# POST endpoint - receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    # Trip ORM object
    trip = Trip(
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        category = category,
        daily_budget = daily_budget,
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

# Update trip by id, recalculate daily budget and category
@app.put("/api/v1/trips/{id}")
def update_trip(id: int, request: TripRequest):
    db = SessionLocal()
    try: 
        trip = db.query(Trip).filter(Trip.id == id).first()

        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip dengan ID {id} tidak ditemukan")

        daily_budget = calculate_daily_budget(request.budget, request.days)
        category = get_trip_category(request.budget)

        trip.destination = request.destination
        trip.days = request.days
        trip.budget = request.budget
        trip.category = category
        trip.daily_budget = daily_budget

        # save to PostgreSQL
        db.commit()
        db.refresh(trip)
        return trip
    
    finally:
        db.close()

# DELETE trip by id
@app.delete("/api/v1/trips/{id}")
def delete_trip(id: int):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()

        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip dengan ID {id} tidak ditemukan")

        db.delete(trip)
        db.commit()

        return "Deleted"

    finally:
        db.close()
    # return {
    #     "destination" : request.destination,
    #     "budget" : request.budget,
    #     "daily_budget" : daily_budget,
    #     "category" : category,
    #     "recommendation_transport" : "Train",
    # }

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

