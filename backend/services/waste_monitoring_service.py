"""
SWCMS Waste Monitoring & Simulation Service
Manages sensor readings, threshold evaluations, status updates,
automatic alert deduplication, and notification generation.
"""

import datetime
from database.db import get_db_connection, memory_store


def process_waste_reading(bin_id, waste_level):
    """
    Process an incoming or simulated waste level reading for a bin.
    Enforces threshold rules, deduplicates active alerts, updates bin status,
    and generates notifications.
    """
    waste_level = float(waste_level)
    waste_level = max(0.0, min(100.0, waste_level))

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)

            # 1. Fetch bin details & thresholds
            cursor.execute("SELECT * FROM garbage_bins WHERE bin_id = %s", (bin_id,))
            bin_data = cursor.fetchone()
            if not bin_data:
                cursor.close()
                conn.close()
                return {"success": False, "error": f"Bin ID {bin_id} not found."}

            warning_threshold = float(bin_data.get("warning_threshold") or 70.0)
            critical_threshold = float(bin_data.get("critical_threshold") or 85.0)

            # Determine new status
            if waste_level >= critical_threshold:
                new_status = "FULL"
            elif waste_level >= warning_threshold:
                new_status = "WARNING"
            else:
                new_status = "NORMAL"

            # 2. Record reading in waste_level_records
            cursor.execute(
                "INSERT INTO waste_level_records (bin_id, waste_level) VALUES (%s, %s)",
                (bin_id, waste_level)
            )

            # 3. Update bin current_level and status
            cursor.execute(
                """
                UPDATE garbage_bins
                SET current_level = %s, status = %s, last_updated = CURRENT_TIMESTAMP
                WHERE bin_id = %s
                """,
                (waste_level, new_status, bin_id)
            )

            # 4. Check for existing active alerts for this bin
            cursor.execute(
                """
                SELECT * FROM alerts
                WHERE bin_id = %s AND status IN ('PENDING', 'ASSIGNED')
                LIMIT 1
                """,
                (bin_id,)
            )
            existing_alert = cursor.fetchone()

            alert_generated = False
            notification_generated = False

            if waste_level >= warning_threshold:
                alert_type = "FULL_BIN" if waste_level >= critical_threshold else "HIGH_WASTE_LEVEL"
                priority = "CRITICAL" if waste_level >= critical_threshold else "HIGH"
                message = f"Bin {bin_data['bin_code']} ({bin_data['location']}) reached {waste_level:.1f}% capacity."

                if existing_alert:
                    # Update existing active alert rather than duplicating
                    cursor.execute(
                        """
                        UPDATE alerts
                        SET waste_level = %s, message = %s, priority = %s
                        WHERE alert_id = %s
                        """,
                        (waste_level, message, priority, existing_alert["alert_id"])
                    )
                else:
                    # Create new alert
                    cursor.execute(
                        """
                        INSERT INTO alerts (bin_id, alert_type, message, waste_level, priority, status)
                        VALUES (%s, %s, %s, %s, %s, 'PENDING')
                        """,
                        (bin_id, alert_type, message, waste_level, priority)
                    )
                    alert_generated = True

                    # Generate in-app notification for authorities
                    notif_title = f"{priority.title()} Waste Alert"
                    notif_msg = f"{bin_data['bin_code']} is at {waste_level:.0f}% in {bin_data.get('area', 'operational area')}."
                    cursor.execute(
                        """
                        INSERT INTO notifications (title, message, priority, is_read)
                        VALUES (%s, %s, %s, FALSE)
                        """,
                        (notif_title, notif_msg, priority)
                    )
                    notification_generated = True

            conn.commit()
            cursor.close()
            conn.close()

            return {
                "success": True,
                "bin_id": bin_id,
                "waste_level": waste_level,
                "status": new_status,
                "alert_generated": alert_generated,
                "notification_generated": notification_generated
            }

        except Exception as e:
            if conn:
                conn.rollback()
                conn.close()
            return {"success": False, "error": str(e)}

    # Resilient MemoryStore execution
    target_bin = next((b for b in memory_store.garbage_bins if b["bin_id"] == int(bin_id)), None)
    if not target_bin:
        return {"success": False, "error": f"Bin ID {bin_id} not found."}

    warning_threshold = float(target_bin.get("warning_threshold", 70.0))
    critical_threshold = float(target_bin.get("critical_threshold", 85.0))

    if waste_level >= critical_threshold:
        new_status = "FULL"
    elif waste_level >= warning_threshold:
        new_status = "WARNING"
    else:
        new_status = "NORMAL"

    target_bin["current_level"] = waste_level
    target_bin["status"] = new_status
    target_bin["last_updated"] = "Just now"

    # Add reading record
    new_record_id = len(memory_store.waste_level_records) + 1
    memory_store.waste_level_records.append({
        "record_id": new_record_id,
        "bin_id": int(bin_id),
        "waste_level": waste_level,
        "recorded_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    # Alert deduplication
    existing_alert = next((a for a in memory_store.alerts if a["bin_id"] == int(bin_id) and a["status"] in ("PENDING", "ASSIGNED")), None)
    alert_generated = False
    notification_generated = False

    if waste_level >= warning_threshold:
        priority = "CRITICAL" if waste_level >= critical_threshold else "HIGH"
        alert_type = "FULL_BIN" if waste_level >= critical_threshold else "HIGH_WASTE_LEVEL"
        message = f"Bin {target_bin['bin_code']} ({target_bin['location']}) reached {waste_level:.1f}% capacity."

        if existing_alert:
            existing_alert["waste_level"] = waste_level
            existing_alert["message"] = message
            existing_alert["priority"] = priority
        else:
            new_alert_id = len(memory_store.alerts) + 1
            memory_store.alerts.append({
                "alert_id": new_alert_id,
                "bin_id": int(bin_id),
                "bin_code": target_bin["bin_code"],
                "location": target_bin["location"],
                "alert_type": alert_type,
                "message": message,
                "waste_level": waste_level,
                "priority": priority,
                "status": "PENDING",
                "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
            alert_generated = True

            # Create notification
            new_notif_id = len(memory_store.notifications) + 1
            memory_store.notifications.append({
                "notification_id": new_notif_id,
                "authority_id": None,
                "title": f"{priority.title()} Waste Alert",
                "message": f"{target_bin['bin_code']} is at {waste_level:.0f}% in {target_bin.get('area', 'operational area')}.",
                "priority": priority,
                "is_read": False,
                "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
            notification_generated = True

    return {
        "success": True,
        "bin_id": int(bin_id),
        "waste_level": waste_level,
        "status": new_status,
        "alert_generated": alert_generated,
        "notification_generated": notification_generated
    }


import random
import threading
import time


def reset_bins_distribution():
    """
    Reset bins to a diverse operational spread across normal, warning, critical, and freshly cleaned (0%).
    """
    sample_levels = [15.0, 38.0, 55.0, 72.0, 81.0, 89.0, 94.0, 0.0, 64.0, 26.0]
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT bin_id FROM garbage_bins ORDER BY bin_id")
            bin_rows = cursor.fetchall()
            cursor.close()
            conn.close()
            for idx, row in enumerate(bin_rows):
                lvl = sample_levels[idx % len(sample_levels)]
                process_waste_reading(row["bin_id"], lvl)
            return {"success": True, "message": "Bins reset to active operational spread"}
        except Exception:
            if conn:
                conn.close()

    for idx, b in enumerate(memory_store.garbage_bins):
        lvl = sample_levels[idx % len(sample_levels)]
        process_waste_reading(b["bin_id"], lvl)
    return {"success": True, "message": "Bins reset to active operational spread"}


def simulate_citywide_tick():
    """
    Simulate a realistic IoT sensor cycle across active bins every 10 seconds:
    1. Full bins (>= 85%) have a 35% chance per cycle to be cleaned/serviced by collection dispatch:
       - Level resets to 0.0% (emptied)
       - Status resets to NORMAL
       - Active alerts resolved
       - Logged to collection history
    2. Other bins (0% to 84%) accumulate realistic waste (+3% to +9.5% per cycle).
    3. As bins cross thresholds (70% Warning, 85% Critical), alerts and notifications are created automatically.
    """
    from services.collection_service import record_bin_collection

    conn = get_db_connection()
    results = []
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT bin_id, current_level FROM garbage_bins WHERE operational_status = 'ACTIVE'")
            bins = cursor.fetchall()
            cursor.close()
            conn.close()

            for b in bins:
                curr = float(b["current_level"] or 0)
                # If bin is full or critical, simulate periodic municipal truck collection
                if curr >= 85.0 and random.random() < 0.35:
                    clean_res = record_bin_collection(
                        bin_id=b["bin_id"],
                        authority_id=1,
                        remarks="Automated routine municipal route pickup (bin emptied to 0%).",
                        authority_name="Municipal Dispatch"
                    )
                    results.append({
                        "bin_id": b["bin_id"],
                        "waste_level": 0.0,
                        "status": "NORMAL",
                        "cleaned": True,
                        "success": True
                    })
                else:
                    # Accumulate waste
                    if curr >= 98.0:
                        new_lvl = 100.0
                    elif curr == 0.0:
                        # Freshly emptied bin starts accumulating
                        new_lvl = round(random.uniform(5.0, 14.0), 1)
                    else:
                        delta = round(random.uniform(3.0, 8.5), 1)
                        new_lvl = round(min(100.0, curr + delta), 1)
                    res = process_waste_reading(b["bin_id"], new_lvl)
                    res["cleaned"] = False
                    results.append(res)
            return {"success": True, "bins_updated": len(results), "readings": results}
        except Exception as e:
            if conn:
                conn.close()

    # MemoryStore
    for b in memory_store.garbage_bins:
        if b.get("operational_status") == "ACTIVE":
            curr = float(b.get("current_level") or 0)
            if curr >= 85.0 and random.random() < 0.35:
                clean_res = record_bin_collection(
                    bin_id=b["bin_id"],
                    authority_id=1,
                    remarks="Automated routine municipal route pickup (bin emptied to 0%).",
                    authority_name="Municipal Dispatch"
                )
                results.append({
                    "bin_id": b["bin_id"],
                    "waste_level": 0.0,
                    "status": "NORMAL",
                    "cleaned": True,
                    "success": True
                })
            else:
                if curr >= 98.0:
                    new_lvl = 100.0
                elif curr == 0.0:
                    new_lvl = round(random.uniform(5.0, 14.0), 1)
                else:
                    delta = round(random.uniform(3.0, 8.5), 1)
                    new_lvl = round(min(100.0, curr + delta), 1)
                res = process_waste_reading(b["bin_id"], new_lvl)
                res["cleaned"] = False
                results.append(res)
    return {"success": True, "bins_updated": len(results), "readings": results}


class RealTimeSimulator:
    def __init__(self):
        self.running = False
        self.interval = 10  # 10 seconds interval as specified
        self.thread = None
        self.last_tick = None
        self.total_ticks = 0

    def _loop(self):
        while self.running:
            try:
                simulate_citywide_tick()
                self.last_tick = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                self.total_ticks += 1
            except Exception as e:
                print(f"[RealTimeSimulator] Error during cycle: {e}")
            time.sleep(self.interval)

    def start(self, interval=10):
        if not self.running:
            self.running = True
            self.interval = max(3, int(interval))
            self.thread = threading.Thread(target=self._loop, daemon=True)
            self.thread.start()
            return True
        return False

    def stop(self):
        self.running = False
        return True

    def status(self):
        return {
            "running": self.running,
            "interval_seconds": self.interval,
            "last_tick": self.last_tick,
            "total_ticks": self.total_ticks
        }


simulator_engine = RealTimeSimulator()
# Auto-start continuous 10-second background simulation on startup
simulator_engine.start(interval=10)