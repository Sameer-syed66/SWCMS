class Notification:
    def __init__(self, notification_id, user_id, message, status):
        self.notification_id = notification_id
        self.user_id = user_id
        self.message = message
        self.status = status