def create_notification(user_id, message):
    return {
        "user_id": user_id,
        "message": message,
        "status": "Unread"
    }


def mark_notification_read(notification):
    notification["status"] = "Read"
    return notification