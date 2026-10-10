import { useState, useEffect, useRef } from "react";
import { Boxes, Search, Radio, Sliders, X, Play, Pause, Zap, Activity } from "lucide-react";
import { binService } from "../../services/binService";
import BinCard from "../../components/BinCard";
import Loading from "../../components/Loading";

export default function BinStatus() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedBin, setSelectedBin] = useState(null);
  const [simLevel, setSimLevel] = useState(85);
  const [simMessage, setSimMessage] = useState("");
  const [autoSimRunning, setAutoSimRunning] = useState(false);
  const [tickLoading, setTickLoading] = useState(false);

  const pollRef = useRef(null);

  useEffect(() => {
    loadBins(true);
    checkSimStatus();

    // 3-second live polling
    pollRef.current = setInterval(() => {
      loadBins(false);
      checkSimStatus();
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function checkSimStatus() {
    try {
      const res = await binService.getSimulationStatus();
      if (res?.status) {
        setAutoSimRunning(Boolean(res.status.running));
      }
    } catch {}
  }

  async function loadBins(showSpinner = false) {
    if (showSpinner) setLoading(true);
    try {
      const res = await binService.list();
      if (res?.bins) setBins(res.bins);
    } catch (err) {
      console.error(err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function handleToggleAutoSim() {
    setTickLoading(true);
    try {
      if (autoSimRunning) {
        await binService.stopAutoSimulation();
        setAutoSimRunning(false);
      } else {
        await binService.startAutoSimulation(4);
        setAutoSimRunning(true);
      }
      loadBins(false);
    } catch {
      alert("Failed to toggle simulator.");
    } finally {
      setTickLoading(false);
    }
  }

  async function handleTriggerTick() {
    setTickLoading(true);
    try {
      await binService.triggerSimulationTick();
      loadBins(false);
    } catch {
      alert("Failed to advance sensor cycle.");
    } finally {
      setTickLoading(false);
    }
  }

  async function handleSimulate(e) {
    e.preventDefault();
    if (!selectedBin) return;
    try {
      const res = await binService.simulate(selectedBin.bin_id, parseFloat(simLevel));
      setSimMessage(`Sensor reading saved! Current fill: ${res.data?.waste_level}% (${res.data?.status}).`);
      loadBins(false);
    } catch (err) {
      setSimMessage("Failed to simulate sensor reading.");
    }
  }

  const filtered = bins.filter(b => {
    if (filter === "ALL") return true;
    return b.status === filter;
  });

  return (
    <div className="page-section">
      <div className="page-actions">
        <div>
          <span className="eyebrow">IOT SENSOR TELEMETRY</span>
          <h2>Real-Time Bin Status</h2>
          <p>Live telemetry and fill levels for all active garbage bins in your operational jurisdiction.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className={`btn btn-sm ${autoSimRunning ? "btn-secondary" : "btn-primary"}`}
            onClick={handleToggleAutoSim}
            disabled={tickLoading}
          >
            {autoSimRunning ? (
              <><Pause size={14} /> Pause Live Stream</>
            ) : (
              <><Play size={14} /> Start Live Stream</>
            )}
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleTriggerTick}
            disabled={tickLoading}
            title="Advance one sensor cycle"
          >
            <Zap size={14} /> Cycle (+Delta)
          </button>
        </div>
      </div>

      {autoSimRunning && (
        <div style={{ background: "#e8f5ee", border: "1px solid #36a56d", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#145938" }}>
          <span className="pulse" />
          <strong>Real-Time Simulation Streaming:</strong>
          <span>Telemetry updates are broadcasting every 4 seconds. Fill levels and threshold alarms update dynamically.</span>
        </div>
      )}

      <div className="toolbar">
        <div className="filter-tabs">
          <button className={filter === "ALL" ? "selected" : ""} onClick={() => setFilter("ALL")}>All Bins ({bins.length})</button>
          <button className={filter === "FULL" ? "selected" : ""} onClick={() => setFilter("FULL")}>Critical/Full ({bins.filter(b => b.status === "FULL").length})</button>
          <button className={filter === "WARNING" ? "selected" : ""} onClick={() => setFilter("WARNING")}>Warning ({bins.filter(b => b.status === "WARNING").length})</button>
          <button className={filter === "NORMAL" ? "selected" : ""} onClick={() => setFilter("NORMAL")}>Normal ({bins.filter(b => b.status === "NORMAL").length})</button>
        </div>
        <div className="toolbar-count">
          Showing <b>{filtered.length}</b> bins · <Radio size={12} color="var(--primary)" /> Live Polling: 3s
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="bin-grid large">
          {filtered.map(b => (
            <BinCard
              key={b.bin_id}
              bin={b}
              onClick={() => {
                setSelectedBin(b);
                setSimLevel(b.current_level);
                setSimMessage("");
              }}
            />
          ))}
        </div>
      )}

      {/* Sensor Detail & Simulator Modal */}
      {selectedBin && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header" style={{ marginBottom: "15px" }}>
              <div>
                <h3>{selectedBin.bin_code} - {selectedBin.location}</h3>
                <p>Zone: {selectedBin.area || "Zone"} · Sensor ID #{selectedBin.bin_id}</p>
              </div>
              <button className="icon-btn" onClick={() => setSelectedBin(null)}><X size={16} /></button>
            </div>

            <div style={{ background: "#f8faf9", padding: "14px", borderRadius: "8px", fontSize: "11px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Current Fill: <b>{selectedBin.current_level}%</b></span>
                <span>Warning Level: <b>{selectedBin.warning_threshold}%</b></span>
                <span>Critical Level: <b>{selectedBin.critical_threshold}%</b></span>
              </div>
              <div className="progress-track" style={{ height: "8px", margin: "6px 0" }}>
                <div
                  className={`progress-fill ${selectedBin.current_level >= selectedBin.critical_threshold ? "critical" : selectedBin.current_level >= selectedBin.warning_threshold ? "high" : "low"}`}
                  style={{ width: `${selectedBin.current_level}%`, transition: "width 0.4s ease" }}
                />
              </div>
            </div>

            <form onSubmit={handleSimulate}>
              <label>
                Simulate Ultrasonic Sensor Reading: <strong>{simLevel}%</strong>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simLevel}
                  onChange={e => setSimLevel(e.target.value)}
                  style={{ marginTop: "10px" }}
                />
              </label>

              {simMessage && (
                <div style={{ background: "#e8f5ee", padding: "10px", borderRadius: "6px", fontSize: "11px", color: "#18794e", fontWeight: "600", marginTop: "10px" }}>
                  {simMessage}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedBin(null)}>Close</button>
                <button type="submit" className="btn btn-primary">Transmit Reading</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
