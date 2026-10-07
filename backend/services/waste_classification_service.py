def classify_waste(waste_type):
    waste_type = waste_type.lower()

    categories = {
        "plastic": "Dry Waste",
        "paper": "Dry Waste",
        "glass": "Dry Waste",
        "metal": "Dry Waste",
        "food": "Wet Waste",
        "organic": "Wet Waste",
        "vegetable": "Wet Waste"
    }

    return categories.get(waste_type, "Other Waste")