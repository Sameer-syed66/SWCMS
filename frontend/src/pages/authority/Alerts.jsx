import { useState, useEffect } from "react";
import { Bell, Filter, CheckCircle2, AlertTriangle, MapPin, Clock } from "lucide-react";
import { alertService } from "../../services/alertService";
import StatusBadge from "../../components/StatusBadge";
import Loading from "../../components/Loading";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  async function loadAlerts() {
    setLoading(true);
    try {
      const statusParam = filter === "ALL" ? "" : filter;
      const res = await alertService.list(statusParam);
      if (res?.alerts) setAlerts(res.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(alertId) {
    try {
      await alertService.resolve(alertId);
      loadAlerts();
    } catch (err) {
      alert("Failed to resolve alert.");
    }
  }

  return (
    <div className="page-section">
      <div className="page-actions">
        <div>
          <span className="eyebrow">AUTOMATIC THRESHOLD ALARMS</span>
          <h2>System Waste Alerts</h2>
          <p>Prioritized notifications triggered when bins cross operational capacity thresholds.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          <button className={filter === "ALL" ? "selected" : ""} onClick={() => setFilter("ALL")}>All Alerts</button>
          <button className={filter === "PENDING" ? "selected" : ""} onClick={() => setFilter("PENDING")}>Pending</button>
          <button className={filter === "RESOLVED" ? "selected" : ""} onClick={() => setFilter("RESOLVED")}>Resolved</button>
        </div>
        <div className="toolbar-count">
          Showing <b>{alerts.length}</b> alerts
        </div>
      </div>

      {loading ? <Loading /> : alerts.length === 0 ? (
        <div className="empty-panel">
          <CheckCircle2 size={36} color="var(--primary)" style={{ margin: "0 auto 10px" }} />
          <h3>No Alerts Found</h3>
          <p>No threshold violation alerts currently match the selected filter.</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map(a => (
            <div key={a.id} className="alert-card" style={{ background: "#fff" }}>
              <div className={`alert-icon ${a.priority.toLowerCase()}`}>
                <AlertTriangle size={18} />
              </div>
              <div className="alert-content">
                <div className="alert-title-row">
                  <strong>{a.title}</strong>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <StatusBadge status={a.priority} />
                    <StatusBadge status={a.status} />
                  </div>
                </div>
                <p>
                  <b>{a.bin}</b> · <MapPin size={12} /> {a.location}
                </p>
                <small>
                  {a.level}% capacity · <Clock size={11} style={{ display: "inline" }} /> {a.time}
                </small>
              </div>
              {a.status === "PENDING" && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleResolve(a.alert_id)}
                >
                  <CheckCircle2 size={13} /> Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
