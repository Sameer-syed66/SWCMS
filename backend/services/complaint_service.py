def create_complaint(user_id, bin_id, complaint_type, description):
    return {
        "user_id": user_id,
        "bin_id": bin_id,
        "complaint_type": complaint_type,
        "description": description,
        "status": "Pending"
    }


def update_complaint_status(complaint, status):
    complaint["status"] = status
    return complaint