class Complaint:
    def __init__(self, complaint_id, user_id, bin_id, complaint_type, description, status):
        self.complaint_id = complaint_id
        self.user_id = user_id
        self.bin_id = bin_id
        self.complaint_type = complaint_type
        self.description = description
        self.status = status
        