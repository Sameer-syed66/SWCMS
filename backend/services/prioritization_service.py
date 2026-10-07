def calculate_priority(waste_level):
    if waste_level >= 80:
        return 1
    elif waste_level >= 60:
        return 2
    elif waste_level >= 30:
        return 3
    else:
        return 4


def prioritize_bins(bins):
    return sorted(
        bins,
        key=lambda bin_data: calculate_priority(bin_data["waste_level"])
    )