def create_alert(bin_id, waste_level):
    if waste_level >= 80:
        return {
            "bin_id": bin_id,
            "alert_type": "Critical",
            "message": "Bin is almost full"
        }

    if waste_level >= 60:
        return {
            "bin_id": bin_id,
            "alert_type": "Warning",
            "message": "Bin waste level is high"
        }

    return None