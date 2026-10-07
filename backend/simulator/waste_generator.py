import random


def generate_waste_level():
    return random.randint(0, 100)


def generate_bin_data(bin_id):
    waste_level = generate_waste_level()

    return {
        "bin_id": bin_id,
        "waste_level": waste_level
    }


def generate_multiple_bins(number_of_bins):
    bins = []

    for bin_id in range(1, number_of_bins + 1):
        bins.append(generate_bin_data(bin_id))

    return bins