# =========================================================
# SWCMS WASTE SIMULATOR CONFIGURATION
# =========================================================

# Number of bins to simulate
NUMBER_OF_BINS = 10

# Minimum and maximum generated waste level
MIN_WASTE_LEVEL = 0
MAX_WASTE_LEVEL = 100

# Waste level thresholds
WARNING_THRESHOLD = 70
FULL_THRESHOLD = 90

# Time between simulation cycles in seconds
SIMULATION_INTERVAL = 10

# Bin IDs used by the simulator
BIN_IDS = list(range(1, NUMBER_OF_BINS + 1))