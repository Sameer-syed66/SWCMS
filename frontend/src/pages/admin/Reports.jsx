import { useState, useEffect } from "react";
import { Download, FileText, Calendar, Filter, FileSpreadsheet, CheckCircle2, AlertTriangle, Truck } from "lucide-react";
import { reportService } from "../../services/reportService";
import Loading from "../../components/Loading";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("collections");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await reportService.getSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleExport(type) {
    const url = reportService.getExportUrl(type);
    window.open(url, "_blank");
  }

  if (loading && !data) return <Loading />;

  const summary = data?.summary || { total_bins: 10, active_alerts: 3, pending_complaints: 2, collections_today: 3 };
  const analytics = data?.analytics || { area_stats: [], overflowing_bins: [], avg_resolution_hours: 4.2 };

  return (
    <div className="page-section">
      <div className="page-actions">
        <div>
          <span className="eyebrow">AUDIT & ACCOUNTABILITY REPORTS</span>
          <h2>Operational Reports & Data Export</h2>
          <p>Generate database-backed summaries, analyze response timelines, and download CSV audit reports.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-primary btn-sm" onClick={() => handleExport("collections")}>
            <Download size={14} /> Export Collections (CSV)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport("complaints")}>
            <Download size={14} /> Export Complaints (CSV)
          </button>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="report-grid">
        {/* Daily Collection Summary */}
        <div className="report-card">
          <div className="report-icon">
            <Truck size={22} />
          </div>
          <h3>Daily Collection Activity Summary</h3>
          <p>
            Records all completed waste pickups, emptied percentages, driver remarks, and linked alert closures recorded for today.
          </p>
          <div style={{ margin: "14px 0", fontSize: "12px", color: "var(--text)" }}>
            <div>Collections recorded today: <b>{summary.collections_today}</b></div>
            <div>Total active monitoring bins: <b>{summary.total_bins}</b></div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => handleExport("collections")}>
            <FileSpreadsheet size={14} /> Download Collection Log
          </button>
        </div>

        {/* Citizen Complaints Audit */}
        <div className="report-card">
          <div className="report-icon">
            <FileText size={22} />
          </div>
          <h3>Citizen Complaint & Resolution Audit</h3>
          <p>
            Summary of all citizen submissions, complaint categories (overflowing garbage, odor, damage), and resolution timeframes.
          </p>
          <div style={{ margin: "14px 0", fontSize: "12px", color: "var(--text)" }}>
            <div>Pending in queue: <b>{summary.pending_complaints}</b></div>
            <div>Avg resolution turnaround: <b>{analytics.avg_resolution_hours} hours</b></div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => handleExport("complaints")}>
            <FileSpreadsheet size={14} /> Download Complaints Log
          </button>
        </div>
      </div>

      {/* Area-wise Waste Audit Summary */}
      <div className="panel" style={{ marginTop: "24px" }}>
        <div className="panel-header">
          <div>
            <h3>Zone-Wise Waste Generation Summary</h3>
            <p>Database aggregation of average waste volume across operational zones.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Zone / Ward</th>
                <th>Monitored Bins</th>
                <th>Average Fill Level</th>
                <th>Condition Assessment</th>
              </tr>
            </thead>
            <tbody>
              {(analytics.area_stats || []).map(a => (
                <tr key={a.area}>
                  <td><strong>{a.area}</strong></td>
                  <td>{a.bin_count} units</td>
                  <td>
                    <span style={{ fontWeight: "700", color: a.avg_level >= 75 ? "var(--danger)" : "var(--text)" }}>
                      {a.avg_level}%
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${a.avg_level >= 75 ? "critical" : a.avg_level >= 60 ? "high" : "normal"}`}>
                      {a.avg_level >= 75 ? "Heavy Waste Load" : a.avg_level >= 60 ? "Moderate Attention" : "Optimal Conditions"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
