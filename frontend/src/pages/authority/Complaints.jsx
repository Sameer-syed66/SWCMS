import { useState, useEffect } from "react";
import { MessageSquareWarning, Search, CheckCircle2, Clock, MapPin, Tag, X, User } from "lucide-react";
import { complaintService } from "../../services/complaintService";
import StatusBadge from "../../components/StatusBadge";
import Loading from "../../components/Loading";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("RESOLVED");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    loadComplaints();
  }, [filter]);

  async function loadComplaints() {
    setLoading(true);
    try {
      const statusParam = filter === "ALL" ? "" : filter;
      const res = await complaintService.list(statusParam);
      if (res?.complaints) setComplaints(res.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(e) {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await complaintService.updateStatus(selectedComplaint.complaint_id, newStatus, remarks);
      setSelectedComplaint(null);
      setRemarks("");
      loadComplaints();
    } catch (err) {
      alert("Failed to update complaint status.");
    }
  }

  return (
    <div className="page-section">
      <div className="page-actions">
        <div>
          <span className="eyebrow">CITIZEN GRIEVANCE RESOLUTION</span>
          <h2>Public Complaints Management</h2>
          <p>Review, assign, and document the resolution of waste issues reported by citizens.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          <button className={filter === "ALL" ? "selected" : ""} onClick={() => setFilter("ALL")}>All</button>
          <button className={filter === "PENDING" ? "selected" : ""} onClick={() => setFilter("PENDING")}>Pending</button>
          <button className={filter === "IN_PROGRESS" ? "selected" : ""} onClick={() => setFilter("IN_PROGRESS")}>In Progress</button>
          <button className={filter === "RESOLVED" ? "selected" : ""} onClick={() => setFilter("RESOLVED")}>Resolved</button>
        </div>
        <div className="toolbar-count">
          Showing <b>{complaints.length}</b> complaints
        </div>
      </div>

      {loading ? <Loading /> : complaints.length === 0 ? (
        <div className="empty-panel">
          <CheckCircle2 size={36} color="var(--primary)" style={{ margin: "0 auto 10px" }} />
          <h3>No Complaints Found</h3>
          <p>No grievances currently match your selected status.</p>
        </div>
      ) : (
        <div className="complaint-list">
          {complaints.map(c => (
            <div
              key={c.id}
              className="complaint-card"
              onClick={() => setSelectedComplaint(c)}
              style={{ cursor: "pointer", background: "#fff" }}
            >
              <div className="complaint-id">{c.id}</div>
              <div className="complaint-main">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{c.subject}</strong>
                  <StatusBadge status={c.status} />
                </div>
                <span><MapPin size={12} /> {c.location}</span>
                <span><Tag size={12} /> Category: {c.category} · Citizen: {c.citizen}</span>
                <span><Clock size={12} /> Reported: {c.date}</span>
                {c.resolution_remarks && (
                  <small style={{ color: "#18794e", fontWeight: "600", marginTop: "4px" }}>
                    Notes: {c.resolution_remarks}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Complaint Modal */}
      {selectedComplaint && (
        <div className="modal-backdrop">
          <div className="modal" style={{ width: "min(500px, 92vw)" }}>
            <div className="panel-header" style={{ marginBottom: "15px" }}>
              <div>
                <h3>Review: {selectedComplaint.id}</h3>
                <p>{selectedComplaint.category} at {selectedComplaint.location}</p>
              </div>
              <button className="icon-btn" onClick={() => setSelectedComplaint(null)}><X size={16} /></button>
            </div>

            <div style={{ background: "#f8faf9", padding: "12px", borderRadius: "8px", fontSize: "11px", marginBottom: "16px" }}>
              <div><strong>Citizen:</strong> {selectedComplaint.citizen} ({selectedComplaint.citizen_email || "No email"})</div>
              <div style={{ marginTop: "6px" }}><strong>Description:</strong></div>
              <p style={{ margin: "3px 0 0", color: "var(--text)" }}>{selectedComplaint.description}</p>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <label>
                Update Resolution Status:
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="IN_PROGRESS">In Progress (Dispatching crew)</option>
                  <option value="RESOLVED">Resolved (Issue addressed)</option>
                  <option value="REJECTED">Rejected (Invalid/Duplicate)</option>
                </select>
              </label>

              <label>
                Resolution Notes / Remarks:
                <textarea
                  rows={3}
                  required
                  placeholder="Document actions taken (e.g. area cleared, bin emptied, lid repaired)..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedComplaint(null)}>Close</button>
                <button type="submit" className="btn btn-primary">Save Status Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
