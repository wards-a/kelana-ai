from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_recommendation_places,
    get_transportation_recommendation,
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

def print_trip_summary(destination, days, budget):
    daily_budget = calculate_daily_budget(budget, days)
    category = get_trip_category(budget)
    transportation = get_transportation_recommendation(category)

    print("========================")
    print("KelanaAI")
    print("========================")
    print()
    print_destinations(destination)
    print()
    print(f"Days            = {days}")
    print(f"Budget          = {budget}")
    print(f"Category        = {category}")
    print(f"Daily Budget    = {daily_budget:.0f} USD/Day")
    print(f"Recommended Transportation: {transportation}")
    print()
    print_recommended_places(destination)

print_trip_summary(["Japan", "Korea"], 5, 1500)

    # print(f"Currency        = {currency}")
    # print(f"Travel Month: {travel_month}")
    # print(f"Destination : {destination}")
    # print(f"Country     : {country}")


# print("========================")
# print("Fill your trip plans")
# print("========================")
# destination = input("Destination : ")
# country = input("Country : ")
# days = int(input("Days : "))
# budget = float(input("Budget : "))
# currency = input("Currency : ")
# travel_month = input("Travel Month : ")
