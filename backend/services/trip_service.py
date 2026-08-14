def calculate_daily_budget(budget, days):
    return budget/days

def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_transportation_recommendation(category):
    if category.lower() == "backpakcer":
        return "Bus"
    elif category.lower() == "standard":
        return "Train"
    else:
        return "Flight"

def get_recommendation_places(destination):
    recommendations = {
        "Japan": ["Tokyo Tower", "Shibuya", "Mount Fuji"],
        "Bali": ["Ubud", "Kuta Beach", "Tanah Lot"],
        "Singapore": ["Mariana Bay Sands", "Gardens by the Bay", "Sentosa"],
    }

    return recommendations.get(destination, ["City Center", "Local Market", "Popular Landmark"])

def get_travel_season(travel_month):
    if travel_month.lower() == "december":
        return "Peak Season"
    elif travel_month.lower() == "june":
        return "Holiday Season"
    else:
        return "Regular Season"