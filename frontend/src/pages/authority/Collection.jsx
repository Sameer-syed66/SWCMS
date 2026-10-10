import { useState, useEffect } from "react";
import { Truck, CheckCircle2, MapPin, AlertTriangle, Clock, X, ShieldAlert, Sparkles } from "lucide-react";
import { collectionService } from "../../services/collectionService";
import Loading from "../../components/Loading";

export default function Collection() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBin, setSelectedBin] = useState(null);
  const [remarks, setRemarks] = useState("Routine collection completed.");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadQueue(true);
    const interval = setInterval(() => {
      // Background silent update without resetting modal/inputs
      if (!selectedBin) {
        loadQueue(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedBin]);

  async function loadQueue(showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      const res = await collectionService.getQueue();
      if (res?.queue) setQueue(res.queue);
    } catch (err) {
      console.error(err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function handleRecordCollection(e) {
    e.preventDefault();
    if (!selectedBin) return;
    try {
      const res = await collectionService.record({
        bin_id: selectedBin.bin_id,
        remarks: remarks || "Bin emptied successfully."
      });
      setSelectedBin(null);
      setSuccessMsg(res.message || "Collection successfully recorded.");
      setTimeout(() => setSuccessMsg(""), 4000);
      loadQueue();
    } catch (err) {
      alert("Collection recording failed.");
    }
  }

  function getPriorityClass(rank) {
    if (rank === 1) return "p1";
    if (rank === 2) return "p2";
    if (rank === 3) return "p3";
    return "";
  }

  return (
    <div className="page-section">
      <div className="page-actions">
        <div>
          <span className="eyebrow">DECISION SUPPORT WORKFLOW</span>
          <h2>Prioritized Collection Queue</h2>
          <p>
            Automated priority ranking calculated from current waste level, citizen complaint severity, and waiting duration.
          </p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", background: "#e8f5ee", color: "#18794e", padding: "6px 12px", borderRadius: "20px", fontWeight: "600", alignSelf: "center" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
          Live Real-Time Prioritization
        </span>
      </div>

      {successMsg && (
        <div style={{ background: "#e8f5ee", border: "1px solid #c0e3d0", padding: "12px", borderRadius: "8px", color: "#18794e", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="collection-banner">
        <Sparkles size={22} color="var(--primary)" />
        <div>
          <strong>Decision Support System Active</strong>
          <span>
            Collection priority is dynamically adjusted using multi-factor evaluation (Fill Level + Complaint Urgency + Wait Duration).
          </span>
        </div>
      </div>

      {loading ? <Loading /> : queue.length === 0 ? (
        <div className="empty-panel">
          <CheckCircle2 size={36} color="var(--primary)" style={{ margin: "0 auto 10px" }} />
          <h3>All Collections Cleared</h3>
          <p>No bins currently exceed the dispatch threshold in this sector.</p>
        </div>
      ) : (
        <div className="collection-cards">
          {queue.map((bin) => (
            <div key={bin.bin_id} className={`collection-card ${bin.current_level === 0 ? "done" : ""}`}>
              <div className={`priority-box ${getPriorityClass(bin.priority_rank)}`}>
                P{bin.priority_rank}
              </div>

              <div className="collection-info">
                <div>
                  <strong>{bin.bin_code}</strong>
                  <span><MapPin size={12} /> {bin.location} ({bin.area || "Zone"})</span>
                  <div style={{ fontSize: "10px", color: "var(--primary)", marginTop: "4px", fontWeight: "600" }}>
                    Status: {bin.priority_level} (Score {bin.priority_score})
                  </div>
                </div>

                <div className="collection-level">
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>Capacity Fill</span>
                  <b style={{ color: bin.current_level >= 85 ? "var(--danger)" : bin.current_level >= 70 ? "var(--warning)" : "var(--primary)" }}>
                    {bin.current_level}%
                  </b>
                  <div className="progress-track" style={{ width: "90px", margin: "4px 0" }}>
                    <div
                      className={`progress-fill ${bin.current_level >= 85 ? "critical" : bin.current_level >= 70 ? "high" : "low"}`}
                      style={{ width: `${bin.current_level}%` }}
                    />
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedBin(bin);
                      setRemarks("Routine collection completed.");
                    }}
                  >
                    <Truck size={14} /> Record Collection
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Collection Modal */}
      {selectedBin && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header" style={{ marginBottom: "15px" }}>
              <div>
                <h3>Record Collection Completion</h3>
                <p>{selectedBin.bin_code} - {selectedBin.location}</p>
              </div>
              <button className="icon-btn" onClick={() => setSelectedBin(null)}><X size={16} /></button>
            </div>

            <p style={{ fontSize: "12px", margin: "0 0 14px" }}>
              Previous Fill Level: <b style={{ color: "var(--danger)" }}>{selectedBin.current_level}%</b><br />
              Submitting collection will reset fill level to <b>0%</b>, resolve linked alerts, and record completion in database history.
            </p>

            <form onSubmit={handleRecordCollection}>
              <label>
                Operational Remarks / Field Notes:
                <input
                  type="text"
                  required
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Bin cleared, cleaned and disinfected"
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedBin(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm & Log Collection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
