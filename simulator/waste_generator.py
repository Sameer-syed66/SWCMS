# =========================================================
# SWCMS WASTE LEVEL SIMULATOR
# =========================================================

import random
import time

from simulator_config import (
    BIN_IDS,
    MIN_WASTE_LEVEL,
    MAX_WASTE_LEVEL,
    SIMULATION_INTERVAL
)


def generate_waste_level():
    """Generate a random waste level between 0 and 100."""

    return round(
        random.uniform(
            MIN_WASTE_LEVEL,
            MAX_WASTE_LEVEL
        ),
        2
    )


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


def run_simulation():
    """Continuously generate waste levels."""

    print("SWCMS Waste Simulator Started")
    print("Press Ctrl+C to stop.")
    print("=" * 40)

    try:
        while True:

            print("\nNew simulation cycle")
            print("-" * 40)

            data = generate_bin_data()

            for bin_info in data:
                print(
                    f"Bin {bin_info['bin_id']:03d} "
                    f"→ {bin_info['waste_level']}%"
                )

            print(
                f"\nNext cycle in "
                f"{SIMULATION_INTERVAL} seconds..."
            )

            time.sleep(SIMULATION_INTERVAL)

    except KeyboardInterrupt:
        print("\n\nSimulator stopped.")


if __name__ == "__main__":
    run_simulation()