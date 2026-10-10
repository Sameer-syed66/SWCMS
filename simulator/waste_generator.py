# =========================================================
# SWCMS WASTE LEVEL SIMULATOR
# Simulates IoT ultrasonic sensor readings and transmits them
# to the SWCMS Flask backend server in real-time.
# =========================================================

import random
import time
import json
import urllib.request
import urllib.error

from simulator_config import (
    BIN_IDS,
    MIN_WASTE_LEVEL,
    MAX_WASTE_LEVEL,
    SIMULATION_INTERVAL
)

API_ENDPOINT = "http://localhost:5000/api/waste/simulate"


def generate_waste_level():
    """Generate a random waste level between 0 and 100."""
    return round(random.uniform(MIN_WASTE_LEVEL, MAX_WASTE_LEVEL), 2)


def generate_bin_data():
    """Generate waste-level data for all bins."""
    bin_data = []
    for bin_id in BIN_IDS:
        waste_level = generate_waste_level()
        bin_data.append({
            "bin_id": bin_id,
            "waste_level": waste_level
        })
    return bin_data


def send_reading_to_api(bin_id, waste_level):
    """Transmit sensor reading to SWCMS Flask backend API."""
    payload = json.dumps({
        "bin_id": bin_id,
        "waste_level": waste_level
    }).encode("utf-8")

    req = urllib.request.Request(
        API_ENDPOINT,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=3) as response:
            return response.status == 200
    except Exception:
        return False


def run_simulation():
    """Continuously generate and transmit waste levels."""
    print("=" * 55)
    print("SWCMS IoT Waste Simulator Started")
    print(f"Target API Endpoint: {API_ENDPOINT}")
    print("Press Ctrl+C to stop.")
    print("=" * 55)

    try:
        while True:
            print("\n[Simulation Cycle Started]")
            data = generate_bin_data()

            for bin_info in data:
                b_id = bin_info["bin_id"]
                w_lvl = bin_info["waste_level"]
                synced = send_reading_to_api(b_id, w_lvl)
                status_icon = "SYNCED" if synced else "STANDALONE"
                print(f"  Bin {b_id:03d} -> {w_lvl:5.1f}% [{status_icon}]")

            print(f"\nNext sensor cycle in {SIMULATION_INTERVAL} seconds...")
            time.sleep(SIMULATION_INTERVAL)

    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")


if __name__ == "__main__":
    run_simulation()