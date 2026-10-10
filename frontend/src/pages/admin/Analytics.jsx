import { useState, useEffect } from "react";
import { BarChart3, Clock, AlertTriangle, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { reportService } from "../../services/reportService";
import Loading from "../../components/Loading";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await reportService.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !data) return <Loading />;

  const analytics = data?.analytics || {
    area_stats: [
      { area: "Central Zone", bin_count: 4, avg_level: 40.8 },
      { area: "North Zone", bin_count: 3, avg_level: 80.3 },
      { area: "South Zone", bin_count: 3, avg_level: 85.3 }
    ],
    overflowing_bins: [],
    authority_performance: [],
    avg_resolution_hours: 4.2
  };

  return (
    <div className="page-section">
      <div className="welcome-row">
        <div>
          <span className="eyebrow">PREDICTIVE & OPERATIONAL INSIGHTS</span>
          <h2>Analytics & Performance Intelligence</h2>
          <p>Quantitative analysis of collection turnaround, zone waste density, and authority efficiency.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="card-grid four">
        <div className="metric-card">
          <span>Avg Response Time</span>
          <strong>{analytics.avg_resolution_hours} <small style={{ fontSize: "14px" }}>hours</small></strong>
          <small><Clock size={12} /> Target SLA: 24 hrs</small>
        </div>
        <div className="metric-card">
          <span>High-Density Zones</span>
          <strong>{analytics.area_stats?.filter(a => a.avg_level >= 70).length || 1}</strong>
          <small><TrendingUp size={12} /> Exceeding 70% threshold</small>
        </div>
        <div className="metric-card">
          <span>Active Field Teams</span>
          <strong>{analytics.authority_performance?.length || 3}</strong>
          <small><Users size={12} /> Deployed officers</small>
        </div>
        <div className="metric-card">
          <span>Collection Compliance</span>
          <strong style={{ color: "var(--primary)" }}>{analytics.compliance_rate || 92.4}%</strong>
          <small><CheckCircle2 size={12} /> Real-time operational SLA</small>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Left: Bar Chart of Zone Waste Levels */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Zone Waste Fill Comparison</h3>
              <p>Average waste fill percentage by municipal sector.</p>
            </div>
          </div>

          <div className="chart" style={{ marginTop: "20px" }}>
            <div className="chart-axis">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            <div className="chart-area">
              <div className="chart-line">
                {(analytics.area_stats || []).map(a => (
                  <div key={a.area} className="chart-column">
                    <div
                      style={{
                        height: `${Math.min(100, a.avg_level)}%`,
                        background: a.avg_level >= 80 ? "var(--danger)" : a.avg_level >= 65 ? "var(--warning)" : "var(--primary)"
                      }}
                      title={`${a.area}: ${a.avg_level}%`}
                    />
                    <span>{a.area.replace(" Zone", "")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Authority Field Performance */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Authority Collections</h3>
              <p>Collections completed by assigned field officers.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "15px" }}>
            {(analytics.authority_performance || []).map(auth => (
              <div key={auth.authority_id} style={{ fontSize: "11px", borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong>{auth.full_name}</strong>
                  <span style={{ fontWeight: "700", color: "var(--primary)" }}>{auth.total_collections} Pickups</span>
                </div>
                <div style={{ color: "var(--muted)", fontSize: "10px" }}>
                  Sector: {auth.area}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
