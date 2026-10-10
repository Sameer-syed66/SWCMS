import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Truck, AlertTriangle, MapPin, CheckCircle2, MessageSquareWarning, ArrowRight } from "lucide-react";
import { alertService } from "../../services/alertService";
import { collectionService } from "../../services/collectionService";
import { notificationService } from "../../services/notificationService";
import DashboardCard from "../../components/DashboardCard";
import AlertCard from "../../components/AlertCard";
import BinCard from "../../components/BinCard";
import Loading from "../../components/Loading";

export default function AuthorityDashboard() {
  const [data, setData] = useState({
    alerts: [],
    queue: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [collectingBin, setCollectingBin] = useState(null);
  const [remarks, setRemarks] = useState("Routine collection completed.");

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => {
      // Background silent update without flipping full loading spinner
      loadData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function loadData(showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      const [alertRes, queueRes, notifRes] = await Promise.all([
        alertService.list("PENDING"),
        collectionService.getQueue(),
        notificationService.list()
      ]);
      setData({
        alerts: alertRes?.alerts || [],
        queue: queueRes?.queue || [],
        notifications: notifRes?.notifications || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function handleRecordCollection(e) {
    e.preventDefault();
    if (!collectingBin) return;
    try {
      await collectionService.record({
        bin_id: collectingBin.bin_id,
        remarks: remarks || "Bin emptied and sanitized."
      });
      setCollectingBin(null);
      loadData();
    } catch (err) {
      alert("Collection recording failed.");
    }
  }

  if (loading) return <Loading />;

  const criticalAlerts = data.alerts.filter(a => a.priority === "CRITICAL");

  return (
    <div className="page-section">
      <div className="welcome-row">
        <div>
          <span className="eyebrow">FIELD OPERATIONS DISPATCH</span>
          <h2>Authority Command Console</h2>
          <p>Prioritized collection queue, critical bin threshold alerts, and real-time field tasks.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", background: "#e8f5ee", color: "#18794e", padding: "6px 12px", borderRadius: "20px", fontWeight: "600" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
            Live Telemetry Auto-Updating
          </span>
          <Link to="/authority/collection" className="btn btn-primary btn-sm">
            <Truck size={15} /> Open Collection Queue
          </Link>
        </div>
      </div>

      {/* Critical Alert Banner if any */}
      {criticalAlerts.length > 0 && (
        <div className="collection-banner" style={{ background: "#fff2f2", borderColor: "#f5c6c6" }}>
          <AlertTriangle size={24} color="#c93f3f" />
          <div>
            <strong style={{ color: "#9c2626" }}>{criticalAlerts.length} Critical Bins Require Immediate Collection</strong>
            <span style={{ color: "#782222" }}>
              Bins in {criticalAlerts.map(a => a.bin).join(", ")} have exceeded critical capacity.
            </span>
          </div>
          <Link to="/authority/collection" className="btn btn-sm" style={{ background: "#c93f3f", color: "#fff" }}>
            Dispatch Now
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="card-grid four">
        <DashboardCard
          title="Active Alerts"
          value={data.alerts.length}
          icon={AlertTriangle}
          tone={data.alerts.length > 0 ? "danger" : "default"}
          subtext="Ordered by priority"
        />
        <DashboardCard
          title="Queue Bins"
          value={data.queue.length}
          icon={Truck}
          subtext="Ranked by decision algorithm"
        />
        <DashboardCard
          title="Critical Fill"
          value={criticalAlerts.length}
          icon={Bell}
          tone={criticalAlerts.length > 0 ? "danger" : "success"}
          subtext="≥ 85% full capacity"
        />
        <DashboardCard
          title="Field Notifications"
          value={data.notifications.filter(n => !n.is_read).length}
          icon={MessageSquareWarning}
          subtext="Unread messages"
        />
      </div>

      {/* Main Grid: Priority Alerts & Top Queue */}
      <div className="dashboard-grid">
        {/* Left: Active Alerts */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Priority Alerts (Highest to Lowest)</h3>
              <p>Critical conditions require field response before low-level alerts.</p>
            </div>
            <Link to="/authority/alerts" className="text-btn">View All →</Link>
          </div>

          {data.alerts.length === 0 ? (
            <div className="empty-panel" style={{ padding: "30px" }}>
              <CheckCircle2 size={32} color="var(--primary)" style={{ margin: "0 auto 8px" }} />
              <h3>All Bins Operating Under Threshold</h3>
              <p>No active alerts pending for your operational zones.</p>
            </div>
          ) : (
            <div className="alert-list">
              {data.alerts.slice(0, 5).map(a => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  onAction={() => {
                    const matched = data.queue.find(q => q.bin_id === a.bin_id);
                    if (matched) setCollectingBin(matched);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Urgent Bins Needing Pickup */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Urgent Bins Needing Collection</h3>
              <p>High fill rate locations prioritized automatically.</p>
            </div>
            <Link to="/authority/collection" className="text-btn">Queue →</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.queue.slice(0, 4).map(b => (
              <div
                key={b.bin_id}
                style={{
                  background: "#f9fbfa",
                  border: "1px solid var(--line)",
                  borderRadius: "9px",
                  padding: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong style={{ fontSize: "12px" }}>{b.bin_code}</strong>
                  <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
                    <MapPin size={11} style={{ display: "inline" }} /> {b.location}
                  </div>
                  <span style={{ fontSize: "9px", color: "var(--primary)", fontWeight: "700" }}>
                    Priority: {b.priority_level} (Score {b.priority_score})
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b style={{ fontSize: "14px", color: b.current_level >= 85 ? "var(--danger)" : "var(--text)" }}>
                    {b.current_level}%
                  </b>
                  <div style={{ marginTop: "6px" }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setCollectingBin(b)}
                    >
                      <Truck size={12} /> Collect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Collection Modal */}
      {collectingBin && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header" style={{ marginBottom: "15px" }}>
              <h3>Record Collection: {collectingBin.bin_code}</h3>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: "12px" }}>
              Location: <b>{collectingBin.location}</b><br />
              Current Fill Level: <b>{collectingBin.current_level}%</b>
            </p>
            <form onSubmit={handleRecordCollection}>
              <label>
                Collection Remarks
                <input
                  type="text"
                  required
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Bin cleared and sanitized"
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setCollectingBin(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm & Reset Bin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
