class GarbageBin:
    def __init__(
        self,
        bin_id,
        location,
        threshold,
        waste_level=0,
        status="Low",
        operational_status="Active"
    ):
        self.bin_id = bin_id
        self.location = location
        self.threshold = threshold
        self.waste_level = waste_level
        self.status = status
        self.operational_status = operational_status