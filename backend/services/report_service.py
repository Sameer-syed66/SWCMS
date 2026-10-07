def generate_report(bins):
    total_bins = len(bins)

    critical_bins = 0
    high_bins = 0

    for bin_data in bins:
        waste_level = bin_data.get("waste_level", 0)

        if waste_level >= 80:
            critical_bins += 1
        elif waste_level >= 60:
            high_bins += 1

    return {
        "total_bins": total_bins,
        "critical_bins": critical_bins,
        "high_bins": high_bins
    }