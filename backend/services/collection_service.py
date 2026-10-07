def create_collection_record(bin_id, collector_id, waste_amount):
    return {
        "bin_id": bin_id,
        "collector_id": collector_id,
        "waste_amount": waste_amount,
        "status": "Collected"
    }


def mark_bin_collected(bin_data):
    bin_data["waste_level"] = 0
    bin_data["status"] = "Low"
    return bin_data