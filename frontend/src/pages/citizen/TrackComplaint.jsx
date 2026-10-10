import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Cpu, Search, CheckCircle, Clock, MapPin, Tag, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { complaintService } from "../../services/complaintService";
import StatusBadge from "../../components/StatusBadge";

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initialCode = searchParams.get("code");
    if (initialCode) {
      handleTrack(initialCode);
    }
  }, [searchParams]);

  async function handleTrack(searchCode = code) {
    if (!searchCode || !searchCode.trim()) return;
    setError("");
    setComplaint(null);
    setLoading(true);

    try {
      const res = await complaintService.track(searchCode.trim());
      if (res?.complaint) {
        setComplaint(res.complaint);
      } else {
        setError("Complaint ID not found. Please check the code and try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Complaint ID not found. Please verify the code.");
    } finally {
      setLoading(false);
    }
  }

  function getStepClass(step) {
    if (!complaint) return "";
    const s = complaint.status.toUpperCase();
    if (step === 1) return "done";
    if (step === 2) {
      if (["IN_PROGRESS", "RESOLVED"].includes(s)) return "done";
      if (["PENDING", "ASSIGNED"].includes(s)) return "current";
      return "";
    }
    if (step === 3) {
      if (s === "RESOLVED") return "done";
      if (s === "IN_PROGRESS") return "current";
      return "";
    }
    if (step === 4) {
      if (s === "RESOLVED") return "done";
      return "";
    }
    return "";
  }

  return (
    <div className="public-form-page">
      <div style={{ position: "absolute", top: "24px", left: "28px", display: "flex", gap: "16px", alignItems: "center" }}>
        <Link to="/" className="public-back" style={{ position: "static" }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <Link to="/smart-bin" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "700", color: "var(--primary)" }}>
          <Cpu size={14} /> Smart Bin
        </Link>
      </div>

      <div className="public-card track-card">
        <div className="form-heading">
          <span className="eyebrow">TRANSPARENT PUBLIC TRACKING</span>
          <h1>Track Complaint Status</h1>
          <p>
            Enter your unique Complaint ID (e.g., <code>CMP-2026-001</code>) to view the current resolution progress.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }}>
          <div className="track-search">
            <div className="input-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Enter Complaint ID (e.g. CMP-2026-001)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Track Status"}
            </button>
          </div>
        </form>

        {error && (
          <div className="form-error" style={{ marginTop: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {complaint && (
          <div className="tracking-result">
            <div className="tracking-head">
              <div>
                <span>COMPLAINT TRACKING ID</span>
                <strong style={{ fontSize: "16px", color: "var(--primary)" }}>{complaint.complaint_code}</strong>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <div style={{ margin: "14px 0", display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "var(--muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Tag size={13} /> {complaint.category || "General Waste Issue"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={13} /> {complaint.location}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={13} /> Reported: {complaint.created_at}
              </span>
            </div>

            <div style={{ background: "#f8faf9", padding: "12px", borderRadius: "8px", fontSize: "11px", marginBottom: "16px" }}>
              <strong>Description:</strong>
              <p style={{ margin: "4px 0 0", color: "var(--text)" }}>{complaint.description}</p>
            </div>

            {complaint.resolution_remarks && (
              <div style={{ background: "#e9f6ef", border: "1px solid #c7e6d4", padding: "12px", borderRadius: "8px", fontSize: "11px", marginBottom: "16px", color: "#145938" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
                  <CheckCircle2 size={15} /> Resolution Notes:
                </div>
                <p style={{ margin: "4px 0 0" }}>{complaint.resolution_remarks}</p>
                {complaint.resolved_at && <small style={{ opacity: 0.8 }}>Resolved on: {complaint.resolved_at}</small>}
              </div>
            )}

            <div className="timeline">
              <div className={`timeline-step ${getStepClass(1)}`}>
                <span>1</span>
                <div>
                  <b>Complaint Lodged</b>
                  <small>Recorded in municipal monitoring database</small>
                </div>
              </div>

              <div className={`timeline-step ${getStepClass(2)}`}>
                <span>2</span>
                <div>
                  <b>Assigned & Reviewed</b>
                  <small>Assigned to area field authority</small>
                </div>
              </div>

              <div className={`timeline-step ${getStepClass(3)}`}>
                <span>3</span>
                <div>
                  <b>Field Action In Progress</b>
                  <small>Waste collection or repairs dispatched</small>
                </div>
              </div>

              <div className={`timeline-step ${getStepClass(4)}`}>
                <span>4</span>
                <div>
                  <b>Resolved & Closed</b>
                  <small>Cleaned up and verified</small>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-footer">
          Need to report a new problem? <Link to="/complaint">Submit a new complaint →</Link>
        </div>
      </div>
    </div>
  );
}
