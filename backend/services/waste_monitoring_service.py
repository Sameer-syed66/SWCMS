def calculate_waste_status(waste_level):
    if waste_level >= 80:
        return "Critical"
    elif waste_level >= 60:
        return "High"
    elif waste_level >= 30:
        return "Medium"
    else:
        return "Low"


def monitor_waste_level(waste_level):
    status = calculate_waste_status(waste_level)

    return {
        "waste_level": waste_level,
        "status": status
    }