import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Radio,
  BatteryCharging,
  Trash2,
  Server,
  Database,
  LayoutDashboard,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Calculator,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  Maximize2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./SmartBinExplorer.css";

// Component hotspot details
const HOTSPOTS = {
  sensor: {
    id: "sensor",
    name: "Ultrasonic Distance Sensor",
    type: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    purpose: "Measures distance from the top of the bin to the waste surface using acoustic time-of-flight pulses.",
    principle: "Emits a 40 kHz ultrasonic burst and measures the round-trip travel time (Echo pulse duration). Distance is calculated using the speed of sound in air (v ≈ 343 m/s at 20°C): Distance = (Time × Speed) / 2.",
    inputOutput: "Input: 5V VCC, 10µs Trigger pulse. Output: TTL Echo pulse width proportional to distance.",
    connection: "Connects to ESP32 GPIO Trigger and Echo pins inside the protected lid enclosure.",
    model: "Proposed Prototype: JSN-SR04T (Waterproof industrial transducer) or HC-SR04.",
    placement: "Mounted under the center of the bin lid facing straight downward into the container cavity."
  },
  enclosure: {
    id: "enclosure",
    name: "Weatherproof Electronics Enclosure",
    type: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    purpose: "Protects sensitive embedded electronics from humidity, corrosive waste odors, and moisture.",
    principle: "IP65-rated sealed polycarbonate box with rubber O-ring seal and cable gland pass-throughs mounted beneath the lid.",
    inputOutput: "Mechanical barrier preventing environmental degradation of MCU and battery.",
    connection: "Houses the ESP32 MCU, power management circuit, and battery pack securely.",
    model: "Proposed Prototype: IP65 ABS/Polycarbonate Weatherproof Junction Enclosure.",
    placement: "Mounted on the upper interior lid away from trash contact."
  },
  esp32: {
    id: "esp32",
    name: "ESP32 Microcontroller Unit",
    type: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    purpose: "Reads sensor measurements, computes fill level percentage, structures JSON telemetry, and transmits via Wi-Fi.",
    principle: "Dual-core Xtensa 32-bit LX6 @ 240 MHz with integrated 2.4 GHz 802.11 b/g/n Wi-Fi and Bluetooth LE. Executes embedded C++ firmware with sleep cycles for low-power operation.",
    inputOutput: "Input: GPIO Echo pulse, ADC battery voltage. Output: Trigger pulse, Wi-Fi HTTP POST JSON payloads.",
    connection: "Communicates with ultrasonic sensor via GPIO; connects wirelessly to municipal network.",
    model: "Proposed Prototype: ESP32-WROOM-32D Development Board.",
    placement: "Housed inside the protective IP65 electronics enclosure."
  },
  battery: {
    id: "battery",
    name: "Power Supply & Battery Module",
    type: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    purpose: "Provides regulated DC electrical energy to power the ESP32 MCU and sensor continuously.",
    principle: "Electrochemical energy storage with step-down buck/boost regulator supplying constant 3.3V and 5V rails. Final battery capacity and solar replenishment will depend on prototype testing.",
    inputOutput: "Input: Rechargeable DC cell voltage. Output: Regulated 3.3V (ESP32) and 5.0V (Ultrasonic sensor).",
    connection: "Supplies power directly to ESP32 Vin / 3V3 pins and sensor VCC via internal power bus.",
    model: "Proposed Prototype: 3.7V 18650 Li-ion battery pack with TP4056 charging + boost module.",
    placement: "Secured in a dedicated compartment inside the IP65 enclosure."
  },
  wifi: {
    id: "wifi",
    name: "2.4 GHz Wi-Fi Radio Uplink",
    type: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    purpose: "Wirelessly transmits structured sensor telemetry packets from the bin location to municipal server.",
    principle: "IEEE 802.11 b/g/n RF transceiver operating in the 2.4 GHz ISM band. Transmits HTTP POST requests with TLS/TCP packets through the RF-transparent plastic container lid.",
    inputOutput: "Input: Encrypted JSON byte payload from ESP32 RAM. Output: 2.4 GHz RF transmission to gateway.",
    connection: "Integrated directly on the ESP32 PCB; connects over local Wi-Fi or municipal hotspot to Flask REST API.",
    model: "Integrated PCB Trace Antenna with +20 dBm output power.",
    placement: "Onboard ESP32 module oriented toward the RF-transparent top lid."
  },
  container: {
    id: "container",
    name: "Heavy-Duty Municipal Waste Container",
    type: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    purpose: "High-density polyethylene receptacle for public garbage collection with known usable internal height.",
    principle: "Sturdy geometric volume providing structural support for trash deposit and known empty baseline height (H_bin) for distance calculations.",
    inputOutput: "Input: Deposited solid waste. Output: Structural housing for sensor detection.",
    connection: "Serves as the physical frame onto which the electronics lid assembly is fitted.",
    model: "Proposed Prototype: Standard 100L or 240L HDPE Municipal Wheelie Garbage Bin.",
    placement: "Placed at designated urban collection points (markets, junctions, bus stands)."
  },
  wiring: {
    id: "wiring",
    name: "Shielded Internal Wiring & GPIO Bus",
    type: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    purpose: "Transfers DC power and digital timing signals between the microcontroller and sensor.",
    principle: "Flexible multi-strand copper conductors with insulation and shielding to suppress electromagnetic interference (EMI) and resist mechanical vibration during trash disposal.",
    inputOutput: "Low-voltage digital control signals (3.3V/5V logic levels).",
    connection: "Connects ESP32 GPIO 4, GPIO 5, 5V, and GND to the sensor transducers.",
    model: "Silicone-jacketed stranded ribbon wire with moisture-sealed connector blocks.",
    placement: "Encased 100% within the protected electronics enclosure and lid channels."
  }
};

// All 8 system components
const ALL_COMPONENTS = [
  {
    key: "ultrasonic",
    title: "Ultrasonic Distance Sensor",
    category: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    icon: Compass,
    purpose: "Acoustic time-of-flight sensor measuring distance from the bin lid to the waste surface.",
    principle: "Sends 40kHz sound burst, records echo time, converts travel duration to centimeters.",
    input: "5V VCC, 10µs digital trigger pulse",
    output: "TTL pulse width (Echo duration)",
    connectsTo: "ESP32 GPIO pins inside lid enclosure"
  },
  {
    key: "esp32",
    title: "ESP32 Microcontroller Unit",
    category: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    icon: Cpu,
    purpose: "Edge computing controller that samples the sensor, computes fill levels, and prepares JSON payloads.",
    principle: "Dual-core 32-bit MCU @ 240 MHz running firmware to sample distance, reject noise, and connect to Wi-Fi.",
    input: "Echo pulse timing from sensor",
    output: "HTTP POST JSON telemetry payload",
    connectsTo: "Ultrasonic sensor via GPIO; Wi-Fi network"
  },
  {
    key: "battery",
    title: "Regulated Power Supply",
    category: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    icon: BatteryCharging,
    purpose: "Supplies stable DC voltage to power the microcontroller and ultrasonic sensor.",
    principle: "Li-ion cell with low-dropout voltage regulation maintaining steady 3.3V and 5.0V output rails.",
    input: "DC electrochemical energy store",
    output: "Regulated 3.3V and 5.0V power rails",
    connectsTo: "ESP32 Vin and Sensor VCC power lines"
  },
  {
    key: "container",
    title: "Garbage Container Receptacle",
    category: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    icon: Trash2,
    purpose: "Physical receptacle with a known usable internal height (H_bin) for fill calculation.",
    principle: "Standardized volumetric cavity allowing ultrasonic waves to reflect off accumulated debris.",
    input: "Deposited municipal waste",
    output: "Physical acoustic reflection cavity",
    connectsTo: "Lid-mounted sensor and electronics enclosure"
  },
  {
    key: "wifi",
    title: "Wi-Fi Wireless Communication",
    category: "PHYSICAL HARDWARE (PROPOSED)",
    tagClass: "proposed",
    icon: Radio,
    purpose: "Transmits structured telemetry from the bin to the municipal Flask server.",
    principle: "2.4 GHz 802.11 b/g/n radio transmitting JSON packets over TCP/IP.",
    input: "JSON telemetry payload in ESP32 RAM",
    output: "RF wireless packets to municipal router/gateway",
    connectsTo: "ESP32 wireless radio -> Cloud / Flask backend"
  },
  {
    key: "flask",
    title: "Flask REST API Backend",
    category: "SOFTWARE & PLATFORM (IMPLEMENTED)",
    tagClass: "software",
    icon: Server,
    purpose: "Receives, validates, sanitizes, and evaluates incoming sensor readings.",
    principle: "Python Flask endpoints (/api/waste/simulate or ingestion) validating range and evaluating alert rules.",
    input: "HTTP POST request with Bin ID & fill reading",
    output: "Database updates & automatic alert triggers",
    connectsTo: "Receives from ESP32; writes to MySQL database"
  },
  {
    key: "mysql",
    title: "MySQL Relational Database",
    category: "SOFTWARE & PLATFORM (IMPLEMENTED)",
    tagClass: "software",
    icon: Database,
    purpose: "Persistent storage of registered bins, historical telemetry readings, active alerts, and collection records.",
    principle: "ACID-compliant relational schema maintaining full audit logs and foreign key relationships.",
    input: "Validated waste levels and collection records",
    output: "Persistent analytics and dashboard queries",
    connectsTo: "Queried by Flask services; serves Admin & Authority portals"
  },
  {
    key: "dashboard",
    title: "Authority Operations Dashboard",
    category: "SOFTWARE & PLATFORM (IMPLEMENTED)",
    tagClass: "software",
    icon: LayoutDashboard,
    purpose: "Operational interface enabling municipal collection officers to act on real-time alerts.",
    principle: "React-powered operational queue ordering bins by priority and logging collection completions.",
    input: "Active alerts and prioritized bin queues",
    output: "Collection verification and bin level resets",
    connectsTo: "Interacts with Flask REST APIs and field teams"
  }
];

// 8 Working Mechanism Steps
const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Waste Detection",
    short: "Ultrasonic Pulse",
    description: "The ultrasonic sensor mounted at the top of the bin emits high-frequency sound waves (40 kHz) downward into the container. When the sound waves hit the surface of the waste pile, they reflect back to the sensor. The sensor records the exact transit duration (time-of-flight) between pulse emission and echo reception.",
    formula: "Distance (cm) = [ Travel Time (µs) × Speed of Sound (0.0343 cm/µs) ] / 2",
    code: `// Step 1: ESP32 triggers sensor ping
digitalWrite(TRIG_PIN, LOW);
delayMicroseconds(2);
digitalWrite(TRIG_PIN, HIGH);
delayMicroseconds(10);
digitalWrite(TRIG_PIN, LOW);
long duration = pulseIn(ECHO_PIN, HIGH);
float measured_distance = (duration * 0.0343) / 2.0;`
  },
  {
    step: 2,
    title: "Fill-Level Calculation",
    short: "Fill Math",
    description: "Using the configured usable internal bin height (H_bin) and the measured distance (D_measured), the system calculates the height of accumulated waste and converts it into a fill percentage. Values are clamped between 0% and 100%, and impossible readings (distance > height or negative) are flagged as sensor errors.",
    formula: "Fill Height = H_usable - D_measured\nFill % = (Fill Height / H_usable) × 100\nClamped: min(max(Fill %, 0), 100)",
    code: `// Step 2: Firmware computes fill percentage
float usable_height = 100.0; // Configured bin depth (cm)
float fill_height = usable_height - measured_distance;
float fill_percent = (fill_height / usable_height) * 100.0;

// Clamping between 0% and 100%
if (fill_percent < 0.0) fill_percent = 0.0;
if (fill_percent > 100.0) fill_percent = 100.0;`
  },
  {
    step: 3,
    title: "ESP32 Processing",
    short: "Telemetry Prep",
    description: "The ESP32 reads multiple samples to filter out transient noise (such as debris temporarily falling past the sensor). It packages the sanitized Bin ID, fill percentage, raw distance, and timestamp into a structured JSON telemetry payload ready for cloud transmission.",
    formula: "Payload = { bin_id, current_level, distance_cm, timestamp }",
    code: `// Step 3: Package JSON telemetry in RAM
StaticJsonDocument<256> doc;
doc["bin_id"] = 8;
doc["bin_code"] = "BIN-008";
doc["waste_level"] = 96.0;
doc["distance_cm"] = 4.0;
doc["status"] = "FULL";
doc["battery_volts"] = 3.92;`
  },
  {
    step: 4,
    title: "Data Transmission",
    short: "Wi-Fi Uplink",
    description: "The ESP32 connects to the configured 2.4 GHz municipal Wi-Fi network and sends an HTTP POST request containing the JSON telemetry to the Flask REST API endpoint. The firmware includes network timeout handling, retry backoff, and enters low-power sleep between transmission intervals.",
    formula: "HTTP POST /api/waste/simulate\nContent-Type: application/json",
    code: `// Step 4: Transmit over Wi-Fi
HTTPClient http;
http.begin(serverUrl);
http.addHeader("Content-Type", "application/json");
int httpCode = http.POST(jsonPayload);
if (httpCode == 200) {
  esp_deep_sleep(SLEEP_INTERVAL_US);
}`
  },
  {
    step: 5,
    title: "Backend Processing",
    short: "Flask Validation",
    description: "The Flask backend receives the HTTP request. It authenticates the client, validates that the Bin ID exists in the database, checks that the fill level falls within valid numerical bounds (0–100%), updates garbage_bins.current_level, and inserts a historical record into waste_level_records.",
    formula: "UPDATE garbage_bins SET current_level = %s WHERE bin_id = %s;\nINSERT INTO waste_level_records ...",
    code: `# Step 5: Flask validation & persistence
@waste_routes.route("/waste/simulate", methods=["POST"])
def receive_reading():
    data = request.get_json() or {}
    bin_id = int(data.get("bin_id"))
    level = float(data.get("waste_level"))
    # Range check & DB persistence
    return process_waste_reading(bin_id, level)`
  },
  {
    step: 6,
    title: "Automatic Alert Generation",
    short: "Threshold Rules",
    description: "During backend processing, the service compares the new reading against configured thresholds: Warning (70%) and Critical Full (85%). If a threshold is crossed, an alert is automatically generated and saved in MySQL. Duplicate active alerts for the same bin are avoided until the previous alert is resolved.",
    formula: "Level >= 85% -> CRITICAL Alert (FULL_BIN)\nLevel >= 70% -> HIGH Alert (HIGH_WASTE_LEVEL)",
    code: `# Step 6: Threshold evaluation & deduplication
if level >= critical_thresh:
    new_status = "FULL"
    create_alert(bin_id, "FULL_BIN", "CRITICAL")
elif level >= warning_thresh:
    new_status = "WARNING"
    create_alert(bin_id, "HIGH_WASTE_LEVEL", "HIGH")`
  },
  {
    step: 7,
    title: "Authority Notification",
    short: "Dispatch Queue",
    description: "The generated alert appears immediately in the Authority Dashboard and operations queue. The system displays the Bin ID, geographic location, current fill percentage, alert generation timestamp, and prioritized urgency score so field teams know exactly which bins to dispatch trucks to.",
    formula: "Priority Score = (Fill Level × 0.7) + (Wait Time × 0.3)",
    code: `// Step 7: Authority Dashboard Queue
const queue = [
  { bin: "BIN-008", level: "96%", priority: "CRITICAL", area: "South Zone" },
  { bin: "BIN-007", level: "93%", priority: "CRITICAL", area: "South Zone" },
  { bin: "BIN-006", level: "88%", priority: "HIGH",     area: "North Zone" }
];`
  },
  {
    step: 8,
    title: "Collection and Reset",
    short: "Physical Emptying",
    description: "The municipal collection crew arrives at the bin location, empties the container, and records completion in the Authority Dashboard. The bin level is logged in collection_history. Crucially, rather than permanently assuming the bin remains at 0%, the very next sensor reading measures the true physical state of the receptacle.",
    formula: "INSERT INTO collection_history (bin_id, collected_level, remarks);\nNext Sensor Cycle -> Measures Actual Empty Baseline",
    code: `# Step 8: Complete collection & log audit record
def record_collection(bin_id, remarks):
    cursor.execute("""
      INSERT INTO collection_history (bin_id, authority_id, collected_level)
      VALUES (%s, %s, %s)
    """, (bin_id, authority_id, current_level))
    cursor.execute("UPDATE garbage_bins SET current_level = 0.0, status = 'NORMAL' WHERE bin_id = %s")`
  }
];

// Telemetry Flow Animation Stages
const FLOW_NODES = [
  { id: 1, name: "Ultrasonic Sensor", icon: Compass, desc: "Acoustic pulse emitted, echo return timed in microseconds." },
  { id: 2, name: "ESP32 MCU", icon: Cpu, desc: "Calculates fill % = ((Height - Distance) / Height) * 100." },
  { id: 3, name: "Wi-Fi Network", icon: Radio, desc: "2.4 GHz RF transmission sends encrypted JSON packet over TCP." },
  { id: 4, name: "Flask REST API", icon: Server, desc: "Validates Bin ID and sanitizes sensor reading values." },
  { id: 5, name: "Threshold Engine", icon: AlertTriangle, desc: "Compares against Warning (70%) and Critical (85%) limits." },
  { id: 6, name: "MySQL Database", icon: Database, desc: "Persists telemetry in waste_level_records and logs active alerts." },
  { id: 7, name: "Authority Dashboard", icon: LayoutDashboard, desc: "Alert dispatched to municipal collection officers." },
  { id: 8, name: "Collection Logged", icon: CheckCircle2, desc: "Bin emptied, collection logged, next sensor ping measures true baseline." }
];

export default function SmartBinExplorer() {
  const { user } = useAuth();

  // Hotspot selection state
  const [activeHotspot, setActiveHotspot] = useState("sensor");

  // Filter for components section
  const [componentFilter, setComponentFilter] = useState("all");

  // Workflow step
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);

  // Flow animation state
  const [animStage, setAnimStage] = useState(1);
  const [animPlaying, setAnimPlaying] = useState(true);

  // Simulation mode sandbox state (Safe client-side)
  const [simLevel, setSimLevel] = useState(74);

  // Math calculator state
  const [calcBinHeight, setCalcBinHeight] = useState(100);
  const [calcDistance, setCalcDistance] = useState(25);

  // Flow animation timer
  useEffect(() => {
    if (!animPlaying) return;
    const interval = setInterval(() => {
      setAnimStage(prev => (prev >= 8 ? 1 : prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, [animPlaying]);

  // Derived math calculations
  const rawFillHeight = calcBinHeight - calcDistance;
  const isDistanceOutOfBounds = calcDistance > calcBinHeight;
  const isNegativeDistance = calcDistance < 0;
  const isBlindZone = calcDistance >= 0 && calcDistance < 2;

  let calculatedFillPercent = 0;
  if (calcBinHeight > 0) {
    calculatedFillPercent = (rawFillHeight / calcBinHeight) * 100;
  }
  const clampedFillPercent = Math.min(Math.max(Math.round(calculatedFillPercent * 10) / 10, 0), 100);

  // Evaluated status for simulation sandbox
  let simStatus = "NORMAL";
  let simAlertText = "No active alert. Bin level is within normal capacity.";
  if (simLevel >= 85) {
    simStatus = "CRITICAL";
    simAlertText = "CRITICAL ALERT: Bin has crossed 85% capacity. Immediate collection dispatch triggered!";
  } else if (simLevel >= 70) {
    simStatus = "WARNING";
    simAlertText = "WARNING ALERT: Bin has reached 70% threshold. Queued for scheduled collection.";
  }

  // Filtered components
  const filteredComponents = ALL_COMPONENTS.filter(c => {
    if (componentFilter === "hardware") return c.category.includes("PHYSICAL");
    if (componentFilter === "software") return c.category.includes("SOFTWARE");
    return true;
  });

  const selectedHotspotData = HOTSPOTS[activeHotspot] || HOTSPOTS.sensor;
  const selectedStepData = WORKFLOW_STEPS.find(s => s.step === activeWorkflowStep) || WORKFLOW_STEPS[0];
  const activeFlowNode = FLOW_NODES.find(n => n.id === animStage) || FLOW_NODES[0];

  return (
    <div className="smart-bin-page">
      {/* Top Navigation */}
      <header className="sbe-nav">
        <div className="sbe-nav-left">
          <Link to="/" className="sbe-brand">
            <span>♻</span> SWCMS
          </Link>
          <div className="sbe-nav-badge">
            <Cpu size={14} /> Smart Bin Explorer
          </div>
        </div>

        <nav className="sbe-nav-links">
          <Link to="/">Public Website</Link>
          <Link to="/complaint">Report Issue</Link>
          <Link to="/track-complaint">Track Complaint</Link>
          {user ? (
            <Link to={user.role === "admin" ? "/admin" : "/authority"} className="btn btn-primary btn-sm">
              <LayoutDashboard size={14} /> Dashboard ({user.role})
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Portal Login</Link>
          )}
        </nav>
      </header>

      {/* Hero Header */}
      <section className="sbe-hero">
        <div className="sbe-hero-eyebrow">
          <Sparkles size={14} /> Proposed IoT Physical Architecture & Telemetry Mechanism
        </div>
        <h1>
          Inside Our <span>Smart Waste Collection</span> System
        </h1>
        <p>
          Discover how our IoT-enabled smart bin detects waste levels, transmits sensor readings,
          and automatically triggers collection alerts across the municipal operations network.
        </p>

        {/* Quick-Jump Section Navigation */}
        <div className="sbe-anchors">
          <a href="#overview" className="sbe-anchor-btn"><Compass size={13} /> 3D Bin Explorer</a>
          <a href="#components" className="sbe-anchor-btn"><Cpu size={13} /> Hardware Components</a>
          <a href="#mechanism" className="sbe-anchor-btn"><Layers size={13} /> 8-Step Mechanism</a>
          <a href="#animation" className="sbe-anchor-btn"><Radio size={13} /> Live Data Flow</a>
          <a href="#simulation" className="sbe-anchor-btn"><Zap size={13} /> Simulation Sandbox</a>
          <a href="#calculator" className="sbe-anchor-btn"><Calculator size={13} /> Sensor Math Calculator</a>
          <a href="#architecture" className="sbe-anchor-btn"><Server size={13} /> 4-Layer Architecture</a>
        </div>
      </section>

      <main className="sbe-container">
        {/* SECTION 1: SMART BIN 3D-STYLE CUTAWAY ILLUSTRATION */}
        <section id="overview">
          <div className="sbe-section-head">
            <span className="eyebrow">PHYSICAL PROTOTYPE INSPECTOR</span>
            <h2>Interactive Smart Bin Cutaway Model</h2>
            <p>
              Click any interactive component hotspot on the physical garbage bin illustration below to inspect
              its role, operational principles, wiring connections, and prototype specifications.
            </p>
          </div>

          <div className="sbe-interactive-showcase">
            {/* SVG Illustration Canvas with Interactive Hotspots */}
            <div className="sbe-svg-canvas">
              <svg viewBox="0 0 460 520" width="420" height="480">
                <defs>
                  {/* Bin Body Gradient */}
                  <linearGradient id="binGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#144f33" />
                    <stop offset="50%" stopColor="#1e6b47" />
                    <stop offset="100%" stopColor="#144f33" />
                  </linearGradient>

                  {/* Cutaway Window Gradient */}
                  <linearGradient id="cutawayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#183628" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0d2419" stopOpacity="0.95" />
                  </linearGradient>

                  {/* Waste Pile Fill Gradient */}
                  <linearGradient id="wasteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#788b56" />
                    <stop offset="50%" stopColor="#556b3c" />
                    <stop offset="100%" stopColor="#3c502b" />
                  </linearGradient>

                  {/* Ultrasonic Waves Pulse */}
                  <radialGradient id="waveGrad" cx="50%" cy="0%" r="90%">
                    <stop offset="0%" stopColor="#64d69a" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#34d399" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Ground Shadow */}
                <ellipse cx="230" cy="495" rx="140" ry="16" fill="rgba(10,35,20,0.18)" />

                {/* Wheels */}
                <circle cx="135" cy="465" r="24" fill="#2d3748" stroke="#1a202c" strokeWidth="4" />
                <circle cx="135" cy="465" r="10" fill="#a0aec0" />
                <circle cx="325" cy="465" r="24" fill="#2d3748" stroke="#1a202c" strokeWidth="4" />
                <circle cx="325" cy="465" r="10" fill="#a0aec0" />

                {/* Bin Outer Body Shell */}
                <polygon points="120,130 340,130 320,460 140,460" fill="url(#binGrad)" stroke="#0e3e27" strokeWidth="4" />

                {/* Bin Structural Ribs */}
                <line x1="130" y1="200" x2="330" y2="200" stroke="#13472e" strokeWidth="3" />
                <line x1="133" y1="280" x2="327" y2="280" stroke="#13472e" strokeWidth="3" />
                <line x1="136" y1="360" x2="324" y2="360" stroke="#13472e" strokeWidth="3" />

                {/* Front Cutaway Inspection Window */}
                <polygon points="150,150 310,150 295,440 165,440" fill="url(#cutawayGrad)" stroke="#4ade80" strokeWidth="2" strokeDasharray="5,5" />

                {/* Accumulated Waste Inside */}
                <path d="M 160,340 Q 190,320 230,335 T 300,325 L 295,440 L 165,440 Z" fill="url(#wasteGrad)" opacity="0.95" />

                {/* Trash details */}
                <rect x="180" y="360" width="30" height="20" rx="3" fill="#cbd5e1" transform="rotate(12, 195, 370)" />
                <circle cx="250" cy="380" r="14" fill="#38bdf8" opacity="0.7" />
                <polygon points="210,390 230,375 240,410" fill="#facc15" opacity="0.8" />
                <rect x="220" y="340" width="35" height="15" rx="2" fill="#e2e8f0" transform="rotate(-8, 235, 345)" />

                {/* Ultrasonic Sound Waves Emission Cone */}
                <polygon points="230,135 160,335 300,335" fill="url(#waveGrad)" />
                <path d="M 215,165 Q 230,175 245,165" stroke="#6ee7b7" strokeWidth="2" fill="none" opacity="0.8" />
                <path d="M 200,200 Q 230,220 260,200" stroke="#6ee7b7" strokeWidth="2.5" fill="none" opacity="0.85" />
                <path d="M 185,245 Q 230,275 275,245" stroke="#6ee7b7" strokeWidth="3" fill="none" opacity="0.9" />

                {/* Protected Electronics Enclosure (Mounted beneath lid) */}
                <rect x="185" y="85" width="90" height="42" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
                <rect x="190" y="90" width="80" height="32" rx="4" fill="#0f172a" />

                {/* ESP32 Module Inside Enclosure */}
                <rect x="195" y="95" width="35" height="22" rx="3" fill="#059669" />
                <rect x="200" y="98" width="18" height="16" rx="2" fill="#0f172a" />
                <circle cx="224" cy="100" r="2" fill="#ef4444" />
                <circle cx="224" cy="106" r="2" fill="#3b82f6" />

                {/* Battery Pack Inside Enclosure */}
                <rect x="235" y="96" width="30" height="20" rx="3" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
                <rect x="238" y="100" width="10" height="12" rx="1" fill="#f59e0b" />
                <text x="252" y="110" fill="#fff" fontSize="8" fontWeight="bold">3.7V</text>

                {/* Ultrasonic Dual Transducers (HC-SR04 / JSN-SR04T) facing down */}
                <rect x="212" y="127" width="36" height="12" rx="3" fill="#2563eb" />
                <circle cx="221" cy="133" r="5" fill="#e2e8f0" stroke="#1d4ed8" strokeWidth="2" />
                <circle cx="239" cy="133" r="5" fill="#e2e8f0" stroke="#1d4ed8" strokeWidth="2" />

                {/* Internal Shielded Cabling connecting MCU to Sensor */}
                <path d="M 212,117 L 212,127" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                <path d="M 228,117 L 228,127" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

                {/* Bin Heavy Duty Lid & Handle */}
                <path d="M 100,85 L 360,85 L 350,70 L 110,70 Z" fill="#144f33" stroke="#0e3e27" strokeWidth="4" />
                <rect x="195" y="55" width="70" height="16" rx="5" fill="#1e6b47" stroke="#0e3e27" strokeWidth="3" />

                {/* Wireless Radio Radiation Waves at Top */}
                <path d="M 210,40 Q 230,25 250,40" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.8" />
                <path d="M 195,28 Q 230,8 265,28" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M 180,16 Q 230,-8 280,16" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.4" />

                {/* INTERACTIVE HOTSPOTS */}
                {/* 1. Ultrasonic Sensor */}
                <g className="sbe-hotspot-pin" onClick={() => setActiveHotspot("sensor")}>
                  <circle cx="230" cy="135" r="14" fill="#3b82f6" fillOpacity="0.3" />
                  <circle cx="230" cy="135" r="8" fill={activeHotspot === "sensor" ? "#2563eb" : "#3b82f6"} stroke="#fff" strokeWidth="2" />
                  <text x="230" y="139" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>
                </g>

                {/* 2. Weatherproof Enclosure */}
                <g className="sbe-hotspot-pin" onClick={() => setActiveHotspot("enclosure")}>
                  <circle cx="170" cy="105" r="14" fill="#10b981" fillOpacity="0.3" />
                  <circle cx="170" cy="105" r="8" fill={activeHotspot === "enclosure" ? "#059669" : "#10b981"} stroke="#fff" strokeWidth="2" />
                  <text x="170" y="109" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
                </g>

                {/* 3. ESP32 MCU */}
                <g className="sbe-hotspot-pin" onClick={() => setActiveHotspot("esp32")}>
                  <circle cx="205" cy="105" r="14" fill="#8b5cf6" fillOpacity="0.3" />
                  <circle cx="205" cy="105" r="8" fill={activeHotspot === "esp32" ? "#7c3aed" : "#8b5cf6"} stroke="#fff" strokeWidth="2" />
                  <text x="205" y="109" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">3</text>
                </g>

                {/* 4. Power Supply / Battery */}
                <g className="sbe-hotspot-pin" onClick={() => setActiveHotspot("battery")}>
                  <circle cx="255" cy="105" r="14" fill="#f59e0b" fillOpacity="0.3" />
                  <circle cx="255" cy="105" r="8" fill={activeHotspot === "battery" ? "#d97706" : "#f59e0b"} stroke="#fff" strokeWidth="2" />
                  <text x="255" y="109" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">4</text>
                </g>

                {/* 5. Wi-Fi Wireless Radio */}
                <g className="sbe-hotspot-pin" onClick={() => setActiveHotspot("wifi")}>
                  <circle cx="230" cy="20" r="14" fill="#06b6d4" fillOpacity="0.3" />
                  <circle cx="230" cy="20" r="8" fill={activeHotspot === "wifi" ? "#0891b2" : "#06b6d4"} stroke="#fff" strokeWidth="2" />
                  <text x="230" y="24" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">5</text>
                </g>

                {/* 6. Garbage Container */}
                <g className="sbe-hotspot-pin" onClick={() => setActiveHotspot("container")}>
                  <circle cx="100" cy="300" r="14" fill="#15803d" fillOpacity="0.3" />
                  <circle cx="100" cy="300" r="8" fill={activeHotspot === "container" ? "#166534" : "#15803d"} stroke="#fff" strokeWidth="2" />
                  <text x="100" y="304" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">6</text>
                </g>

                {/* 7. Internal Wiring */}
                <g className="sbe-hotspot-pin" onClick={() => setActiveHotspot("wiring")}>
                  <circle cx="280" cy="130" r="14" fill="#ec4899" fillOpacity="0.3" />
                  <circle cx="280" cy="130" r="8" fill={activeHotspot === "wiring" ? "#db2777" : "#ec4899"} stroke="#fff" strokeWidth="2" />
                  <text x="280" y="134" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">7</text>
                </g>
              </svg>

              <div className="sbe-canvas-hint">
                <Info size={14} color="var(--primary)" /> Click numbered pins 1–7 to inspect hardware modules
              </div>
            </div>

            {/* Inspector Details Panel */}
            <div className="sbe-inspector-panel">
              <div className="sbe-inspector-card">
                <div className="sbe-inspector-header">
                  <div>
                    <span className={`sbe-tag ${selectedHotspotData.tagClass}`}>{selectedHotspotData.type}</span>
                    <h3 style={{ marginTop: "6px" }}>{selectedHotspotData.name}</h3>
                  </div>
                </div>

                <p className="sbe-inspector-desc">{selectedHotspotData.purpose}</p>

                <div className="sbe-inspector-props">
                  <div className="sbe-prop-box">
                    <span>Operating Principle</span>
                    <strong>{selectedHotspotData.principle}</strong>
                  </div>
                  <div className="sbe-prop-box">
                    <span>Proposed Specification</span>
                    <strong>{selectedHotspotData.model}</strong>
                  </div>
                  <div className="sbe-prop-box">
                    <span>Physical Placement</span>
                    <strong>{selectedHotspotData.placement}</strong>
                  </div>
                  <div className="sbe-prop-box">
                    <span>Electrical I/O</span>
                    <strong>{selectedHotspotData.inputOutput}</strong>
                  </div>
                </div>

                <div className="sbe-inspector-connection">
                  <strong>Interconnection to System:</strong> {selectedHotspotData.connection}
                </div>
              </div>

              {/* Hotspot quick selector buttons */}
              <div className="sbe-hotspot-selectors">
                {Object.keys(HOTSPOTS).map(k => (
                  <button
                    key={k}
                    type="button"
                    className={`sbe-hotspot-pill ${activeHotspot === k ? "active" : ""}`}
                    onClick={() => setActiveHotspot(k)}
                  >
                    {HOTSPOTS[k].name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HARDWARE COMPONENTS GRID */}
        <section id="components">
          <div className="sbe-section-head">
            <span className="eyebrow">HARDWARE & SYSTEM SPECIFICATIONS</span>
            <h2>Hardware Components</h2>
            <p>
              Detailed breakdown of the physical prototype modules, embedded computing, and software endpoints.
              Physical hardware is labeled as proposed prototype components, while software endpoints reflect the existing SWCMS deployment.
            </p>
          </div>

          <div className="sbe-filter-bar">
            <button
              className={`sbe-filter-btn ${componentFilter === "all" ? "active" : ""}`}
              onClick={() => setComponentFilter("all")}
            >
              All Components (8)
            </button>
            <button
              className={`sbe-filter-btn ${componentFilter === "hardware" ? "active" : ""}`}
              onClick={() => setComponentFilter("hardware")}
            >
              Physical Hardware (Proposed) (5)
            </button>
            <button
              className={`sbe-filter-btn ${componentFilter === "software" ? "active" : ""}`}
              onClick={() => setComponentFilter("software")}
            >
              Software & Cloud Platform (Implemented) (3)
            </button>
          </div>

          <div className="sbe-components-grid">
            {filteredComponents.map(c => {
              const IconComp = c.icon;
              return (
                <div key={c.key} className="sbe-comp-card">
                  <div className="sbe-comp-head">
                    <div className="sbe-comp-icon">
                      <IconComp size={20} />
                    </div>
                    <span className={`sbe-tag ${c.tagClass}`}>{c.category}</span>
                  </div>

                  <h4>{c.title}</h4>
                  <p className="sbe-comp-purpose">{c.purpose}</p>

                  <div className="sbe-comp-details">
                    <div className="sbe-comp-detail-row">
                      <span>Working Principle</span>
                      <strong>{c.principle}</strong>
                    </div>
                    <div className="sbe-comp-detail-row">
                      <span>Input Signal</span>
                      <strong>{c.input}</strong>
                    </div>
                    <div className="sbe-comp-detail-row">
                      <span>Output Signal</span>
                      <strong>{c.output}</strong>
                    </div>
                    <div className="sbe-comp-detail-row">
                      <span>Interconnect</span>
                      <strong>{c.connectsTo}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: COMPLETE WORKING MECHANISM (8 STEPS) */}
        <section id="mechanism">
          <div className="sbe-section-head">
            <span className="eyebrow">END-TO-END TELEMETRY PIPELINE</span>
            <h2>Complete Working Mechanism</h2>
            <p>
              From acoustic sound pulse emission to municipal collection record: explore the complete 8-step lifecycle
              that drives autonomous waste monitoring.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="sbe-steps-track">
            {WORKFLOW_STEPS.map(s => (
              <div
                key={s.step}
                className={`sbe-step-tab ${activeWorkflowStep === s.step ? "active" : ""}`}
                onClick={() => setActiveWorkflowStep(s.step)}
              >
                <span className="sbe-step-tab-num">STEP 0{s.step}</span>
                <strong>{s.title}</strong>
              </div>
            ))}
          </div>

          {/* Spotlight Card */}
          <div className="sbe-step-spotlight">
            <div className="sbe-step-spotlight-left">
              <span className="sbe-hero-eyebrow" style={{ fontSize: "10px", padding: "4px 10px", marginBottom: "10px" }}>
                STAGE {selectedStepData.step} OF 8: {selectedStepData.short.toUpperCase()}
              </span>
              <h3>{selectedStepData.title}</h3>
              <p>{selectedStepData.description}</p>

              <div style={{ background: "#f3f8f5", borderLeft: "3px solid var(--primary)", padding: "10px 14px", borderRadius: "0 8px 8px 0", fontSize: "11px", color: "#184933", marginBottom: "16px" }}>
                <strong>Mathematical / Protocol Principle:</strong>
                <pre style={{ margin: "4px 0 0", fontFamily: "monospace", color: "var(--primary)" }}>{selectedStepData.formula}</pre>
              </div>

              <div className="sbe-step-controls">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={activeWorkflowStep <= 1}
                  onClick={() => setActiveWorkflowStep(prev => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={14} /> Previous Stage
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={activeWorkflowStep >= 8}
                  onClick={() => setActiveWorkflowStep(prev => Math.min(prev + 1, 8))}
                >
                  Next Stage <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="sbe-step-spotlight-right">
              <span style={{ display: "block", color: "#6ee7b7", fontSize: "10px", fontWeight: "700", marginBottom: "8px" }}>
                FIRMWARE / BACKEND LOGIC PREVIEW
              </span>
              <pre>{selectedStepData.code}</pre>
            </div>
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE DATA-FLOW ANIMATION */}
        <section id="animation">
          <div className="sbe-section-head">
            <span className="eyebrow">LIVE TELEMETRY TRACER</span>
            <h2>Interactive Data-Flow Animation</h2>
            <p>
              Watch telemetry packets journey across network boundaries in real-time from the physical bin sensor
              to municipal field collection trucks.
            </p>
          </div>

          <div className="sbe-animation-panel">
            <div className="sbe-animation-controls">
              <div className="sbe-ctrl-group">
                <button
                  type="button"
                  className={`btn ${animPlaying ? "btn-outline" : "btn-primary"} btn-sm`}
                  onClick={() => setAnimPlaying(!animPlaying)}
                >
                  {animPlaying ? <><Pause size={14} /> Pause Stream</> : <><Play size={14} /> Play Stream</>}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => { setAnimStage(1); setAnimPlaying(true); }}
                >
                  <RotateCcw size={14} /> Restart Flow
                </button>
              </div>

              <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>
                Currently Highlighting Stage: <strong style={{ color: "var(--primary)" }}>{activeFlowNode.name}</strong> ({animStage} / 8)
              </div>
            </div>

            {/* Nodes Chain */}
            <div className="sbe-flow-nodes">
              <div className="sbe-flow-line">
                <div
                  className="sbe-flow-line-progress"
                  style={{ width: `${((animStage - 1) / (FLOW_NODES.length - 1)) * 100}%` }}
                />
              </div>

              {FLOW_NODES.map(node => {
                const IconComp = node.icon;
                const isActive = animStage === node.id;
                const isCompleted = animStage > node.id;
                return (
                  <div
                    key={node.id}
                    className={`sbe-flow-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                    onClick={() => { setAnimStage(node.id); setAnimPlaying(false); }}
                  >
                    <div className="sbe-node-circle">
                      <IconComp size={18} />
                    </div>
                    <span className="sbe-node-label">{node.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Stage Detailed Card */}
            <div className="sbe-flow-stage-desc">
              <div>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase" }}>
                  STAGE {activeFlowNode.id}: {activeFlowNode.name}
                </span>
                <h4 style={{ margin: "4px 0 6px", fontSize: "15px", color: "#113825" }}>{activeFlowNode.desc}</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#486657" }}>
                  Telemetry state transition verified under IEEE 802.11 and Flask REST API specification.
                </p>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #cce0d4", borderRadius: "8px", padding: "8px 14px", fontSize: "11px", fontFamily: "monospace", color: "#174d32" }}>
                PACKET STATUS: <strong>STREAMING ACTIVE</strong>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: SIMULATION MODE SANDBOX */}
        <section id="simulation">
          <div className="sbe-section-head">
            <span className="eyebrow">SANDBOX DEMONSTRATION</span>
            <h2>Simulation Mode Demonstration</h2>
            <p>
              Experiment with sensor readings safely. This client-side sandbox demonstrates the telemetry workflow
              without modifying real municipal bins, creating false alerts, or writing to the production database.
            </p>
          </div>

          <div className="sbe-sandbox-box">
            <div className="sbe-sandbox-banner">
              <Info size={18} color="#b45309" />
              <div>
                <strong>Client-Side Conceptual Sandbox:</strong> Adjust the fill slider below to observe how the
                ESP32 packages telemetry JSON, evaluates warning thresholds, and would dispatch alerts in the Authority Dashboard.
                No real hardware readings are simulated as live production data.
              </div>
            </div>

            <div className="sbe-sandbox-grid">
              {/* Slider & Presets */}
              <div className="sbe-sim-gauge-wrap">
                <div className="sbe-sim-slider-row">
                  <label>
                    <span>Simulated Waste Fill Percentage:</span>
                    <strong style={{ fontSize: "16px", color: simLevel >= 85 ? "var(--danger)" : simLevel >= 70 ? "var(--warning)" : "var(--primary)" }}>
                      {simLevel}%
                    </strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simLevel}
                    onChange={e => setSimLevel(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)" }}>
                    <span>0% (Empty)</span>
                    <span>70% (Warning)</span>
                    <span>85% (Critical Full)</span>
                    <span>100% (Overflow)</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#506f60", display: "block", marginBottom: "6px" }}>
                    QUICK TEST SCENARIOS:
                  </span>
                  <div className="sbe-sim-presets">
                    <button type="button" className="sbe-preset-btn" onClick={() => setSimLevel(12)}>
                      Empty Bin (12%)
                    </button>
                    <button type="button" className="sbe-preset-btn" onClick={() => setSimLevel(48)}>
                      Normal Daily (48%)
                    </button>
                    <button type="button" className="sbe-preset-btn" onClick={() => setSimLevel(74)}>
                      Warning Approaching (74%)
                    </button>
                    <button type="button" className="sbe-preset-btn" onClick={() => setSimLevel(94)}>
                      Critical Full (94%)
                    </button>
                  </div>
                </div>

                {/* Outcome Display */}
                <div style={{
                  background: simStatus === "CRITICAL" ? "#fef2f2" : simStatus === "WARNING" ? "#fffbeb" : "#f0fdf4",
                  border: `1px solid ${simStatus === "CRITICAL" ? "#fca5a5" : simStatus === "WARNING" ? "#fde68a" : "#bbf7d0"}`,
                  borderRadius: "10px",
                  padding: "14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px"
                }}>
                  {simStatus === "CRITICAL" ? (
                    <AlertTriangle size={20} color="#dc2626" />
                  ) : simStatus === "WARNING" ? (
                    <AlertTriangle size={20} color="#d97706" />
                  ) : (
                    <CheckCircle2 size={20} color="#16a34a" />
                  )}
                  <div>
                    <strong style={{ display: "block", fontSize: "12px", color: simStatus === "CRITICAL" ? "#991b1b" : simStatus === "WARNING" ? "#92400e" : "#166534" }}>
                      STATUS: {simStatus}
                    </strong>
                    <span style={{ fontSize: "11px", color: "#374151" }}>{simAlertText}</span>
                  </div>
                </div>
              </div>

              {/* Generated Live JSON Payload */}
              <div className="sbe-payload-box">
                <h4>
                  <Zap size={14} color="#68d391" /> Generated ESP32 Telemetry JSON Packet
                </h4>
                <pre>{JSON.stringify({
                  bin_code: "BIN-SIM-001",
                  sensor_type: "ULTRASONIC_DISTANCE",
                  usable_height_cm: 100.0,
                  measured_distance_cm: Math.round((100 - simLevel) * 10) / 10,
                  calculated_fill_percent: simLevel,
                  threshold_status: simStatus,
                  battery_voltage: 3.94,
                  wifi_rssi_dbm: -58,
                  timestamp: new Date().toISOString()
                }, null, 2)}</pre>
              </div>
            </div>

            {/* Comparison Table: Simulated vs Physical Hardware */}
            <div style={{ marginTop: "24px" }}>
              <table className="sbe-comp-table">
                <thead>
                  <tr>
                    <th>Aspect</th>
                    <th>Simulated Demonstration (Current Web Mode)</th>
                    <th>Actual Hardware Integration (Proposed Prototype)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Data Source</strong></td>
                    <td>Interactive client browser state / math engine</td>
                    <td>Physical JSN-SR04T ultrasonic acoustic reflection</td>
                  </tr>
                  <tr>
                    <td><strong>Compute Edge</strong></td>
                    <td>Client browser JavaScript sandbox</td>
                    <td>ESP32 dual-core Xtensa microcontroller firmware</td>
                  </tr>
                  <tr>
                    <td><strong>Network Medium</strong></td>
                    <td>In-memory simulation; optional test endpoints</td>
                    <td>2.4 GHz 802.11 b/g/n wireless HTTP POST uplink</td>
                  </tr>
                  <tr>
                    <td><strong>Database Impact</strong></td>
                    <td>None (Isolated sandbox prevents database mutation)</td>
                    <td>Persistent sensor records in MySQL waste_level_records</td>
                  </tr>
                  <tr>
                    <td><strong>Hardware Status</strong></td>
                    <td>100% operational in frontend UI</td>
                    <td>Awaiting physical prototype component assembly</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 6: SENSOR MATHEMATICS & FILL-LEVEL CALCULATOR */}
        <section id="calculator">
          <div className="sbe-section-head">
            <span className="eyebrow">MATHEMATICAL PRINCIPLES</span>
            <h2>Sensor Math & Fill-Level Calculator</h2>
            <p>
              Experiment with bin geometry and ultrasonic distance measurements. Understand how raw acoustic distance
              converts into calibrated volumetric fill percentage.
            </p>
          </div>

          <div className="sbe-calc-grid">
            {/* Input Controls & Breakdown */}
            <div className="sbe-calc-inputs">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#254837" }}>
                  Usable Bin Height (H_bin) in cm:
                  <input
                    type="number"
                    min="20"
                    max="200"
                    value={calcBinHeight}
                    onChange={e => setCalcBinHeight(Number(e.target.value))}
                    style={{ display: "block", width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cfe0d6" }}
                  />
                </label>

                <label style={{ fontSize: "11px", fontWeight: "700", color: "#254837" }}>
                  Measured Distance (D) in cm:
                  <input
                    type="number"
                    min="-10"
                    max="220"
                    value={calcDistance}
                    onChange={e => setCalcDistance(Number(e.target.value))}
                    style={{ display: "block", width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cfe0d6" }}
                  />
                </label>
              </div>

              {/* Slider for Distance */}
              <div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#607d70" }}>
                  ADJUST MEASURED DISTANCE SLIDER (0cm to {calcBinHeight}cm):
                </span>
                <input
                  type="range"
                  min="0"
                  max={calcBinHeight}
                  value={Math.min(Math.max(calcDistance, 0), calcBinHeight)}
                  onChange={e => setCalcDistance(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--primary)", marginTop: "6px" }}
                />
              </div>

              {/* Step-by-Step Formula Cards */}
              <div className="sbe-calc-step-card">
                <h4>1. Fill Height Derivation</h4>
                <div className="sbe-formula-block">
                  Fill Height = H_bin - D = {calcBinHeight} cm - {calcDistance} cm = {rawFillHeight} cm
                </div>
              </div>

              <div className="sbe-calc-step-card">
                <h4>2. Fill Percentage Formula</h4>
                <div className="sbe-formula-block">
                  Fill % = (Fill Height / H_bin) × 100 = ({rawFillHeight} / {calcBinHeight}) × 100 = {calculatedFillPercent.toFixed(1)}%
                </div>
              </div>

              <div className="sbe-calc-step-card">
                <h4>3. Clamping & Boundary Validation</h4>
                <div className="sbe-formula-block">
                  Clamped Fill Level = min(max({calculatedFillPercent.toFixed(1)}%, 0%), 100%) = {clampedFillPercent}%
                </div>
              </div>

              {/* Edge Case Warnings */}
              {isDistanceOutOfBounds && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "10px 14px", borderRadius: "8px", fontSize: "11px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <AlertTriangle size={16} />
                  <span><strong>Warning:</strong> Measured distance exceeds usable bin height ({calcDistance}cm &gt; {calcBinHeight}cm). Indicates sensor displacement or empty pit void!</span>
                </div>
              )}

              {isNegativeDistance && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "11px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <AlertTriangle size={16} />
                  <span><strong>Error:</strong> Negative measured distance is physically impossible. Value must be rejected by firmware.</span>
                </div>
              )}

              {isBlindZone && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", padding: "10px 14px", borderRadius: "8px", fontSize: "11px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <Info size={16} />
                  <span><strong>Blind Zone Notice:</strong> Distance is under 2cm. Standard ultrasonic transducers (HC-SR04/JSN-SR04T) experience a blind-spot below 2cm–20cm where echo pulses overlap with trigger bursts.</span>
                </div>
              )}
            </div>

            {/* Visual Graphic Representation */}
            <div className="sbe-calc-visual">
              <div className="sbe-bin-graphic">
                {/* Lid */}
                <div className="sbe-sensor-lid">ULTRASONIC SENSOR</div>

                {/* Distance line */}
                <div
                  className="sbe-distance-line"
                  style={{ height: `${Math.min(Math.max((calcDistance / calcBinHeight) * 238, 0), 238)}px` }}
                />

                {/* Fill level */}
                <div
                  className={`sbe-bin-level-fill ${clampedFillPercent >= 85 ? "critical" : clampedFillPercent >= 70 ? "warning" : ""}`}
                  style={{ height: `${(clampedFillPercent / 100) * 238}px` }}
                />
              </div>

              <strong style={{ fontSize: "20px", color: clampedFillPercent >= 85 ? "var(--danger)" : clampedFillPercent >= 70 ? "var(--warning)" : "var(--primary)" }}>
                {clampedFillPercent}% Full
              </strong>
              <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                Effective Waste Height: {Math.max(rawFillHeight, 0)} cm of {calcBinHeight} cm
              </span>

              {/* Engineering Disclaimers */}
              <div style={{ textAlign: "left", background: "#ffffff", border: "1px solid #d4e2da", borderRadius: "10px", padding: "12px", marginTop: "16px", fontSize: "10px", color: "#456153", lineHeight: "1.5" }}>
                <strong>Physical Accuracy Factors:</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: "16px" }}>
                  <li><strong>Beam Angle (15° cone):</strong> Sound waves spread outwards; obstacles on side walls may reflect prematurely.</li>
                  <li><strong>Surface Unevenness:</strong> Trash accumulates irregularly rather than forming a level horizontal plane.</li>
                  <li><strong>Temperature Effect:</strong> Speed of sound varies with ambient air temperature: v ≈ 331.3 + (0.606 × T).</li>
                  <li><strong>Empty Calibration:</strong> Bins must be calibrated when empty to lock in exact usable internal height (H_bin).</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FOUR-LAYER SYSTEM ARCHITECTURE */}
        <section id="architecture">
          <div className="sbe-section-head">
            <span className="eyebrow">SYSTEM BLUEPRINT</span>
            <h2>Four-Layer System Architecture</h2>
            <p>
              Hierarchical view of the complete Smart Waste Collection and Monitoring System, mapping the proposed
              physical IoT edge layers to the implemented cloud application and presentation tiers.
            </p>
          </div>

          <div className="sbe-arch-wrap">
            {/* Layer 1: Physical */}
            <div className="sbe-arch-layer">
              <div className="sbe-arch-layer-head">
                <div>
                  <span className="sbe-tag proposed">PROPOSED PROTOTYPE</span>
                  <h3 style={{ marginTop: "4px" }}>1. Physical & IoT Edge Layer</h3>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>Edge Telemetry Generation</span>
              </div>
              <div className="sbe-arch-grid">
                <div className="sbe-arch-card proposed">
                  <strong>Ultrasonic Sensor (JSN-SR04T)</strong>
                  <p>Acoustic distance measurement to surface</p>
                </div>
                <div className="sbe-arch-card proposed">
                  <strong>ESP32 Microcontroller</strong>
                  <p>Dual-core 32-bit MCU computing fill level percentage</p>
                </div>
                <div className="sbe-arch-card proposed">
                  <strong>IP65 Weatherproof Enclosure</strong>
                  <p>Hermetically sealed housing protecting electronics</p>
                </div>
                <div className="sbe-arch-card proposed">
                  <strong>Wi-Fi 802.11 b/g/n Transmitter</strong>
                  <p>Wireless HTTP JSON packet transmission</p>
                </div>
              </div>
            </div>

            {/* Layer 2: Application */}
            <div className="sbe-arch-layer">
              <div className="sbe-arch-layer-head">
                <div>
                  <span className="sbe-tag software">IMPLEMENTED SOFTWARE</span>
                  <h3 style={{ marginTop: "4px" }}>2. Application & Services Layer</h3>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>Flask REST Backend Services</span>
              </div>
              <div className="sbe-arch-grid">
                <div className="sbe-arch-card">
                  <strong>Flask REST API Endpoints</strong>
                  <p>/api/waste/simulate, /api/collections, /api/auth</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>Input Validation Service</strong>
                  <p>Sanitizes numerical inputs and checks bin existence</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>Threshold Rule Engine</strong>
                  <p>Evaluates warning (70%) and critical (85%) conditions</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>Alert Deduplication</strong>
                  <p>Prevents redundant alerts for unresolved conditions</p>
                </div>
              </div>
            </div>

            {/* Layer 3: Data */}
            <div className="sbe-arch-layer">
              <div className="sbe-arch-layer-head">
                <div>
                  <span className="sbe-tag software">IMPLEMENTED SOFTWARE</span>
                  <h3 style={{ marginTop: "4px" }}>3. Data Persistence Layer</h3>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>Relational MySQL Database</span>
              </div>
              <div className="sbe-arch-grid">
                <div className="sbe-arch-card">
                  <strong>garbage_bins</strong>
                  <p>Locations, capacities, coordinates, operational status</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>waste_level_records</strong>
                  <p>Audit trail of all historical sensor telemetry pings</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>alerts</strong>
                  <p>High and critical alerts with pending/resolved status</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>collection_history</strong>
                  <p>Verified timestamps, authority officers, and collected levels</p>
                </div>
              </div>
            </div>

            {/* Layer 4: Presentation */}
            <div className="sbe-arch-layer">
              <div className="sbe-arch-layer-head">
                <div>
                  <span className="sbe-tag software">IMPLEMENTED SOFTWARE</span>
                  <h3 style={{ marginTop: "4px" }}>4. Presentation & User Experience Layer</h3>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>React Frontend Web Interfaces</span>
              </div>
              <div className="sbe-arch-grid">
                <div className="sbe-arch-card">
                  <strong>Administrator Portal</strong>
                  <p>City-wide analytics, bin management, officer approvals</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>Authority Operations Portal</strong>
                  <p>Real-time prioritized alert queue, collection logging</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>Citizen Public Portal</strong>
                  <p>Public complaint filing and live ticket tracking</p>
                </div>
                <div className="sbe-arch-card">
                  <strong>Smart Bin Explorer</strong>
                  <p>Educational IoT architecture and telemetry visualization</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section style={{
          background: "linear-gradient(135deg, #112e20 0%, #195238 100%)",
          color: "#ffffff",
          borderRadius: "20px",
          padding: "45px 35px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(15, 50, 30, 0.2)"
        }}>
          <h2 style={{ fontFamily: "Manrope", fontSize: "28px", fontWeight: "800", margin: "0 0 12px" }}>
            Experience the Complete SWCMS Platform
          </h2>
          <p style={{ maxWidth: "600px", margin: "0 auto 24px", color: "#a8cfbd", fontSize: "13px", lineHeight: "1.6" }}>
            Now that you understand the proposed physical IoT bin mechanism, explore the live municipal dashboards
            or report public waste issues through our citizen complaint portal.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/complaint" className="btn btn-primary btn-lg" style={{ background: "#48bb78", color: "#062817" }}>
              Report a Waste Issue <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" style={{ background: "transparent", color: "#ffffff", borderColor: "#71a389" }}>
              Access Operations Portal
            </Link>
            <Link to="/track-complaint" className="btn btn-outline btn-lg" style={{ background: "transparent", color: "#ffffff", borderColor: "#71a389" }}>
              Track Existing Complaint
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
