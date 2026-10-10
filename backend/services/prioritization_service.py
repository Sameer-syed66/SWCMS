"""
SWCMS Decision Support & Prioritization Service
Combines waste level, citizen complaint severity, waiting time, and location
into a transparent, documented priority score for operational collection.
"""

import datetime


def calculate_bin_priority_score(bin_data, complaints=None, alerts=None):
    """
    Calculate an operational priority score (higher score = higher collection priority).
    
    Formula:
    Score = Waste_Score + Complaint_Score + Wait_Time_Score
    
    - Waste Score:
        >= 90%: +60 points
        >= 85%: +50 points
        >= 70%: +35 points
        >= 50%: +20 points
        < 50%:  +5 points
        
    - Complaint Score:
        Pending complaint for bin:
        - "Overflowing Garbage" / "Illegal Dumping": +25 points
        - "Bad Odor" / "Damaged Bin": +15 points
        - "Sensor Failure" / "Others": +10 points
        
    - Wait Time Score:
        Hours since alert triggered or complaint lodged: +2 points per hour (max 20 points)
    """
    waste_level = float(bin_data.get("current_level") or bin_data.get("waste_level") or 0)
    score = 0

    # 1. Waste Level Weight
    if waste_level >= 90:
        score += 60
    elif waste_level >= 85:
        score += 50
    elif waste_level >= 70:
        score += 35
    elif waste_level >= 50:
        score += 20
    else:
        score += 5

    bin_id = bin_data.get("bin_id")

    # 2. Complaint Severity
    if complaints:
        for c in complaints:
            if c.get("bin_id") == bin_id and c.get("status") in ("PENDING", "IN_PROGRESS", "ASSIGNED"):
                cat = c.get("category", "")
                if cat in ("Overflowing Garbage", "Illegal Dumping"):
                    score += 25
                elif cat in ("Bad Odor", "Damaged Bin"):
                    score += 15
                else:
                    score += 10
                break

    # 3. Waiting Time
    if alerts:
        for a in alerts:
            if a.get("bin_id") == bin_id and a.get("status") in ("PENDING", "ASSIGNED"):
                created_at = a.get("created_at")
                if isinstance(created_at, str):
                    try:
                        created_dt = datetime.datetime.fromisoformat(created_at.replace("Z", ""))
                        hours_waiting = (datetime.datetime.now() - created_dt).total_seconds() / 3600.0
                        score += min(20, int(hours_waiting * 2))
                    except Exception:
                        pass
                break

    # Determine Priority Level
    if score >= 65:
        priority_level = "CRITICAL"
        priority_rank = 1
    elif score >= 45:
        priority_level = "HIGH"
        priority_rank = 2
    elif score >= 25:
        priority_level = "MEDIUM"
        priority_rank = 3
    else:
        priority_level = "LOW"
        priority_rank = 4

    return {
        "score": score,
        "priority_level": priority_level,
        "priority_rank": priority_rank
    }


def prioritize_collection_queue(bins, complaints=None, alerts=None):
    """
    Sort bins for the Authority Collection Queue so the most critical bins are handled first.
    """
    scored_bins = []
    for b in bins:
        b_copy = dict(b)
        res = calculate_bin_priority_score(b_copy, complaints, alerts)
        b_copy["priority_score"] = res["score"]
        b_copy["priority_level"] = res["priority_level"]
        b_copy["priority_rank"] = res["priority_rank"]
        scored_bins.append(b_copy)

    # Sort descending by priority_score, then descending by current_level
    scored_bins.sort(key=lambda x: (x["priority_score"], float(x.get("current_level") or x.get("waste_level") or 0)), reverse=True)
    return scored_bins