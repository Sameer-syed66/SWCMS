import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Boxes, BellRing, MessageSquareWarning, Truck, Sparkles, BarChart2, AlertTriangle, ArrowRight, Activity, MapPin, Play, Pause, Zap, RotateCcw } from "lucide-react";
import { reportService } from "../../services/reportService";
import { binService } from "../../services/binService";
import DashboardCard from "../../components/DashboardCard";
import Loading from "../../components/Loading";
import StatusBadge from "../../components/StatusBadge";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simBinId, setSimBinId] = useState("");
  const [simLevel, setSimLevel] = useState("92");
  const [simMsg, setSimMsg] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [bins, setBins] = useState([]);
  const [autoSimRunning, setAutoSimRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  const pollRef = useRef(null);

  useEffect(() => {
    loadDashboard(true);
    checkSimStatus();

    // Live auto-refresh polling every 3 seconds
    pollRef.current = setInterval(() => {
      loadDashboard(false);
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
        setTickCount(res.status.total_ticks || 0);
      }
    } catch {}
  }

  async function loadDashboard(showSpinner = false) {
    if (showSpinner) setLoading(true);
    try {
      const [dashRes, binsRes] = await Promise.all([
        reportService.getDashboard(),
        binService.list()
      ]);
      setData(dashRes);
      if (binsRes?.bins) {
        setBins(binsRes.bins);
        if (!simBinId && binsRes.bins.length > 0) {
          setSimBinId(binsRes.bins[0].bin_id);
        }
      }
    } catch (err) {
      console.error("Dashboard poll failed", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function handleToggleAutoSim() {
    setSimLoading(true);
    try {
      if (autoSimRunning) {
        await binService.stopAutoSimulation();
        setAutoSimRunning(false);
        setSimMsg("Live simulation paused.");
      } else {
        await binService.startAutoSimulation(10);
        setAutoSimRunning(true);
        setSimMsg("Live real-time simulation running: sensor cycles transmitting every 10s.");
      }
      loadDashboard(false);
    } catch (err) {
      setSimMsg("Failed to toggle simulator.");
    } finally {
      setSimLoading(false);
    }
  }

  async function handleTriggerSingleTick() {
    setSimLoading(true);
    try {
      const res = await binService.triggerSimulationTick();
      setSimMsg(`Citywide cycle executed: updated ${res.data?.bins_updated || 10} bins with new sensor telemetry.`);
      loadDashboard(false);
    } catch (err) {
      setSimMsg("Failed to advance sensor cycle.");
    } finally {
      setSimLoading(false);
    }
  }

  async function handleResetSim() {
    setSimLoading(true);
    try {
      await binService.resetSimulation();
      setSimMsg("Bins reset to operational spread: normal, warning, critical, and freshly emptied (0%).");
      loadDashboard(false);
    } catch (err) {
      setSimMsg("Failed to reset bins.");
    } finally {
      setSimLoading(false);
    }
  }

  async function handleSimulate(e) {
    e.preventDefault();
    if (!simBinId) return;
    setSimLoading(true);
    setSimMsg("");
    try {
      const res = await binService.simulate(parseInt(simBinId), parseFloat(simLevel));
      setSimMsg(`Simulated reading applied: Bin ${res.data?.bin_id} is now ${res.data?.waste_level}% (${res.data?.status}).`);
      loadDashboard(false);
    } catch (err) {
      setSimMsg(`Simulation error: ${err?.message || "Failed"}`);
    } finally {
      setSimLoading(false);
    }
  }

  if (loading && !data) return <Loading />;

  const summary = data?.summary || {
    total_bins: bins.length || 10,
    active_alerts: 3,
    pending_complaints: 2,
    collections_today: 3,
    distribution: { normal_count: 5, warning_count: 2, full_count: 3 }
  };
  const analytics = data?.analytics || {
    area_stats: [],
    overflowing_bins: [],
    authority_performance: [],
    avg_resolution_hours: 4.5
  };

  const dist = summary.distribution || {};
  const totalDist = (dist.normal_count || 0) + (dist.warning_count || 0) + (dist.full_count || 0) || 1;
  const normalPct = Math.round(((dist.normal_count || 0) / totalDist) * 100);
  const warningPct = Math.round(((dist.warning_count || 0) / totalDist) * 100);
  const fullPct = Math.round(((dist.full_count || 0) / totalDist) * 100);

  return (
    <div className="page-section">
      <div className="welcome-row">
        <div>
          <span className="eyebrow">CENTRALIZED MONITORING & GOVERNANCE</span>
          <h2>Administrator Operations Center</h2>
          <p>Real-time citywide waste conditions, threshold alerts, citizen inquiries, and authority performance.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {autoSimRunning ? (
            <span className="status-badge active" style={{ animation: "pulse 1.5s infinite" }}>
              <span className="pulse" /> Live Telemetry Streaming (Cycle #{tickCount})
            </span>
          ) : (
            <span className="status-badge" style={{ color: "var(--muted)" }}>
              ○ Live Telemetry Paused
            </span>
          )}
          <Link to="/admin/bins" className="btn btn-primary btn-sm">
            <Boxes size={15} /> Manage Bins
          </Link>
        </div>
      </div>

      {/* Real-time simulation control banner */}
      <div
        className="collection-banner"
        style={{
          background: autoSimRunning ? "#e8f5ee" : "#f2f7f4",
          borderColor: autoSimRunning ? "#36a56d" : "var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Activity size={22} color={autoSimRunning ? "var(--primary)" : "var(--muted)"} />
          <div>
            <strong>Real-Time IoT Sensor Simulation Engine</strong>
            <span>
              {autoSimRunning
                ? "Autonomous background simulation is actively generating sensor fill fluctuations and threshold triggers every 10 seconds."
                : "Continuous real-time simulation is currently paused. Start it below or trigger instant sensor cycles."}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`btn btn-sm ${autoSimRunning ? "btn-secondary" : "btn-primary"}`}
            onClick={handleToggleAutoSim}
            disabled={simLoading}
          >
            {autoSimRunning ? (
              <><Pause size={14} /> Pause Live Simulation</>
            ) : (
              <><Play size={14} /> Start Live Simulation</>
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleTriggerSingleTick}
            disabled={simLoading}
            title="Advance one full citywide sensor reading cycle"
          >
            <Zap size={14} /> Trigger 1 Sensor Cycle
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleResetSim}
            disabled={simLoading}
            title="Reset bins to operational test distribution"
          >
            <RotateCcw size={14} /> Reset Test Spread
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="card-grid four">
        <DashboardCard
          title="Registered Bins"
          value={summary.total_bins}
          icon={Boxes}
          subtext="Configured sensor units"
          badgeText="Active Network"
        />
        <DashboardCard
          title="Active Alerts"
          value={summary.active_alerts}
          icon={BellRing}
          tone={summary.active_alerts > 0 ? "danger" : "default"}
          subtext="Requires field collection"
          badgeText={summary.active_alerts > 0 ? "Action Required" : "All Clear"}
        />
        <DashboardCard
          title="Pending Complaints"
          value={summary.pending_complaints}
          icon={MessageSquareWarning}
          subtext="Citizen submissions"
          badgeText="In SLA Queue"
        />
        <DashboardCard
          title="Completed Collections"
          value={summary.collections_today}
          icon={Truck}
          tone="success"
          subtext={`Network Efficiency: ${summary.collection_efficiency ?? 88}%`}
          badgeText={`${summary.collection_efficiency ?? 88}% Efficiency`}
        />
      </div>

      {/* Main Grid: Waste Distribution & Area Breakdown */}
      <div className="dashboard-grid">
        {/* Left: Waste Level Distribution & Overflowing Bins */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Waste Level Distribution & Efficiency</h3>
              <p>Proportion of city bins by current fill category and live operational efficiency.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", background: "#e8f5ee", color: "#18794e", padding: "4px 10px", borderRadius: "16px", fontWeight: "700" }}>
                Efficiency: {summary.collection_efficiency ?? 88}%
              </span>
              <span className="live-tag">● Real-Time</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", margin: "15px 0 24px" }}>
            <div style={{ background: "#f2f7f4", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>Normal (&lt;70%)</span>
              <strong style={{ display: "block", fontSize: "20px", color: "#18794e", marginTop: "4px" }}>
                {dist.normal_count || 0} ({normalPct}%)
              </strong>
            </div>
            <div style={{ background: "#fff9ee", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>Warning (70-84%)</span>
              <strong style={{ display: "block", fontSize: "20px", color: "#b77816", marginTop: "4px" }}>
                {dist.warning_count || 0} ({warningPct}%)
              </strong>
            </div>
            <div style={{ background: "#fff2f2", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>Critical (≥85%)</span>
              <strong style={{ display: "block", fontSize: "20px", color: "#c93f3f", marginTop: "4px" }}>
                {dist.full_count || 0} ({fullPct}%)
              </strong>
            </div>
          </div>

          <div className="progress-track" style={{ height: "12px", display: "flex", borderRadius: "99px", overflow: "hidden", background: "#edf1ef" }}>
            <div style={{ width: `${normalPct}%`, background: "#44a976", transition: "width 0.4s ease" }} title={`Normal: ${normalPct}%`} />
            <div style={{ width: `${warningPct}%`, background: "#d5a341", transition: "width 0.4s ease" }} title={`Warning: ${warningPct}%`} />
            <div style={{ width: `${fullPct}%`, background: "#d45151", transition: "width 0.4s ease" }} title={`Critical: ${fullPct}%`} />
          </div>

          <div style={{ marginTop: "30px" }}>
            <div className="panel-header" style={{ marginBottom: "10px" }}>
              <div>
                <h3>Frequently Overflowing Bins</h3>
                <p>Bins triggering high priority collections most frequently.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Bin Code</th>
                    <th>Location</th>
                    <th>Area</th>
                    <th>Current Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.overflowing_bins || []).map((b) => (
                    <tr key={b.bin_id}>
                      <td><strong>{b.bin_code}</strong></td>
                      <td>{b.location}</td>
                      <td>{b.area || "Zone"}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "700" }}>{b.current_level}%</span>
                          <div className="progress-track" style={{ width: "60px", margin: 0 }}>
                            <div
                              className={`progress-fill ${b.current_level >= 85 ? "critical" : b.current_level >= 70 ? "high" : "low"}`}
                              style={{ width: `${b.current_level}%`, transition: "width 0.4s ease" }}
                            />
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={b.current_level >= 85 ? "FULL" : b.current_level >= 70 ? "WARNING" : "NORMAL"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Area Breakdown & Interactive Simulator */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Area-Wise Waste Levels</h3>
                <p>Average capacity fill by operational zone.</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(analytics.area_stats || []).map((a) => (
                <div key={a.area} style={{ fontSize: "11px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span><strong>{a.area}</strong> ({a.bin_count} bins)</span>
                    <span style={{ fontWeight: "700", color: a.avg_level >= 75 ? "var(--danger)" : "var(--text)" }}>{a.avg_level}% avg</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${a.avg_level >= 75 ? "critical" : a.avg_level >= 60 ? "medium" : "low"}`}
                      style={{ width: `${Math.min(100, a.avg_level)}%`, transition: "width 0.4s ease" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Single-Bin Manual Sensor Simulator */}
          <div className="panel" style={{ background: "#f8fbf9", border: "1px solid #c9e2d3" }}>
            <div className="panel-header">
              <div>
                <span className="eyebrow" style={{ fontSize: "9px" }}>INDIVIDUAL SENSOR INJECTION</span>
                <h3 style={{ marginTop: "3px" }}>Manual Bin Simulator</h3>
                <p>Inject exact sensor telemetry into any specific bin.</p>
              </div>
              <Activity size={18} color="var(--primary)" />
            </div>

            <form onSubmit={handleSimulate} style={{ gap: "10px" }}>
              <label>
                Select Target Bin:
                <select value={simBinId} onChange={e => setSimBinId(e.target.value)}>
                  {bins.map(b => (
                    <option key={b.bin_id} value={b.bin_id}>
                      {b.bin_code} - {b.location} (Currently {b.current_level}%)
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Simulate Waste Level: {simLevel}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simLevel}
                  onChange={e => setSimLevel(e.target.value)}
                  style={{ marginTop: "8px" }}
                />
              </label>

              {simMsg && (
                <div style={{ fontSize: "10px", padding: "8px", borderRadius: "6px", background: "#e8f5ee", color: "#18794e", fontWeight: "600" }}>
                  {simMsg}
                </div>
              )}

              <button className="btn btn-primary btn-sm" type="submit" disabled={simLoading}>
                {simLoading ? "Transmitting..." : "Send Specific Reading"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
