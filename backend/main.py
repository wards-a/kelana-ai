from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from models.user import User
from models.trip import Trip
from database import SessionLocal, init_db
from services.bedrock_service import get_ai_recommendation
from services.auth_service import register_user, RegistrationError, login_user, LoginError, get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    travel_style:   str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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

# POST endpoint - user registration
@app.post("/api/v1/auth/register")
def register(request: RegisterRequest):
    """
    Register a new user
    
    Args:
        request: Registration request containing name, email, and password
        
    Returns:
        User object with id, name, email, and created_at
        
    Raises:
        HTTPException: If registration fails (e.g., email already exists)
    """
    try:
        user = register_user(
            name=request.name,
            email=request.email,
            password=request.password
        )
        return {
            "success": True,
            "message": "User registered successfully",
            "user": user
        }
    except RegistrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )

# POST endpoint - user login
@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    """
    Authenticate user and return JWT token
    
    Args:
        request: Login request containing email and password
        
    Returns:
        JWT access token and user information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        result = login_user(
            email=request.email,
            password=request.password
        )
        return {
            "success": True,
            "message": "Login successful",
            "data": result
        }
    except LoginError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )

# GET endpoint - get current user profile with trip count
@app.get("/api/v1/auth/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's profile information
    
    Args:
        current_user: Current user from JWT token (dependency injection)
        
    Returns:
        User profile with name, email, id, and total trips count
        
    Raises:
        HTTPException: If user is not authenticated
    """
    db = SessionLocal()
    try:
        user_id = int(current_user["sub"])
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Count trips for this user
        trip_count = db.query(Trip).filter(Trip.user_id == user_id).count()
        
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at,
            "total_trips": trip_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )
    finally:
        db.close()

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

# GET all trips for current user
@app.get("/api/v1/trips")
def list_trips(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    user_id = int(current_user["sub"])
    trips = db.query(Trip).filter(Trip.user_id == user_id).all()
    db.close()
    return trips

# GET one specific trip by trip_id (with ownership verification)
@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    user_id = int(current_user["sub"])
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    
    # Verify user owns this trip
    if trip.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this trip")
    
    return trip

# POST endpoint - receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest, current_user: dict = Depends(get_current_user)):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    ai_recommendation = get_ai_recommendation(
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        travel_style = request.travel_style,
    )

    # Trip ORM object
    trip = Trip(
        user_id = int(current_user["sub"]),
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        travel_style = request.travel_style,
        category = category,
        daily_budget = daily_budget,
        ai_recommendation = ai_recommendation
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

# POST Endpoint - generate AI Recommendation
@app.post("/api/v1/trips/{id}/generate")
def create_ai_recommendation(id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    user_id = int(current_user["sub"])
    try: 
        trip = db.query(Trip).filter(Trip.id == id).first()

        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {id} not found")
        
        # Verify user owns this trip
        if trip.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to generate recommendations for this trip")

        ai_recommendation = get_ai_recommendation(
            destination = trip.destination,
            days = trip.days,
            budget = trip.budget,
            travel_style = trip.travel_style,
        )

        trip.ai_recommendation = ai_recommendation

        # save to PostgreSQL
        db.commit()
        db.refresh(trip)

        return trip
    
    finally:
        db.close()

# Update trip by id, recalculate daily budget and category
@app.put("/api/v1/trips/{id}")
def update_trip(id: int, request: TripRequest, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    user_id = int(current_user["sub"])
    try: 
        trip = db.query(Trip).filter(Trip.id == id).first()

        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {id} not found")
        
        # Verify user owns this trip
        if trip.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to update this trip")

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

# DELETE trip by id (with ownership verification)
@app.delete("/api/v1/trips/{id}")
def delete_trip(id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    user_id = int(current_user["sub"])
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()

        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {id} not found")
        
        # Verify user owns this trip
        if trip.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this trip")

        db.delete(trip)
        db.commit()

        return {"message": "Trip deleted successfully"}

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

