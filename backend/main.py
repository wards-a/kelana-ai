from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_recommendation_places,
    get_transportation_recommendation,
    get_travel_season,
)

def print_destinations(destinations):
    print("Your Destinations")

    index = 0
    while index < len(destinations):
        print(f"{index +1}. {destinations[index]}")
        index += 1

def print_recommended_places(destinations):
    print("Recommended Places")

    for destination in destinations:
        print(destination)

        for place in get_recommendation_places(destination):
            print(f"- {place}")
        
        print()

def print_trip_summary(destination, days, budget, travel_month):
    daily_budget = calculate_daily_budget(budget, days)
    category = get_trip_category(budget)
    transportation = get_transportation_recommendation(category)
    season = get_travel_season(travel_month)

    print()
    print("========================")
    print("KelanaAI")
    print("========================")
    print()
    print_destinations(destination)
    # print(f"Country         = {country}")
    print()
    print(f"Days            = {days}")
    print(f"Budget          = {budget} USD")
    print(f"Category        = {category}")
    print(f"Daily Budget    = {daily_budget:.0f} USD/Day")
    # print(f"Currency        = {currency}")
    print(f"Travel Month    = {travel_month}")
    print(f"Season          = {season}")
    print(f"Recommended Transportation: {transportation}")
    print()
    print_recommended_places(destination)


destinations = []

while True:
    place = input("Enter a destination (or type 'selesai' to finish): ")

    # Check if the user wants to exit
    if place.lower() == 'selesai':
        break # This exits the loop immediately

    destinations.append(place)


print("Your full trip itienary:", destinations)

# country = input("Country : ")
days = int(input("Days : "))
budget = float(input("Budget : "))
    # currency = input("Currency : ")
travel_month = input("Travel Month : ")

print_trip_summary(destinations, days, budget, travel_month)

