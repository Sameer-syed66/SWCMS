import { useState, useEffect } from "react";
import { ArrowRight, BarChart3, BellRing, CheckCircle2, Cpu, MapPin, Recycle, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { reportService } from "../services/reportService";
import { binService } from "../services/binService";

export default function LandingPage() {
  const [metrics, setMetrics] = useState({
    efficiency: 85,
    attentionCount: 3,
    bins: [45, 68, 52, 79, 74, 91, 62, 30]
  });

  useEffect(() => {
    loadLiveOverview();
    const interval = setInterval(() => {
      loadLiveOverview();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  async function loadLiveOverview() {
    try {
      const [sumRes, binsRes] = await Promise.all([
        reportService.getSummary(),
        binService.list()
      ]);
      const eff = sumRes?.summary?.collection_efficiency ?? 85;
      const att = sumRes?.summary?.active_alerts ?? 3;
      const binList = binsRes?.bins || [];
      const levels = binList.length > 0 ? binList.slice(0, 8).map(b => Math.round(b.current_level)) : [45, 68, 52, 79, 74, 91, 62, 30];
      setMetrics({
        efficiency: Math.round(eff),
        attentionCount: att,
        bins: levels
      });
    } catch {}
  }

  return (
    <div className="landing">
      <header className="landing-nav">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link to="/" className="landing-brand"><span>♻</span> SWCMS</Link>
          <Link
            to="/smart-bin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(24, 121, 78, 0.14)",
              color: "var(--primary)",
              padding: "6px 12px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: "800",
              border: "1px solid rgba(24, 121, 78, 0.28)",
              textDecoration: "none"
            }}
            title="Explore physical smart garbage bin hardware and IoT working mechanism"
          >
            <Cpu size={14} /> Smart Bin
          </Link>
        </div>
        <nav>
          <Link to="/smart-bin" style={{ fontWeight: "700", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Cpu size={13} /> Smart Bin
          </Link>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/track-complaint">Track complaint</Link>
          <Link className="btn btn-primary btn-sm" to="/login">Portal Login</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> Smart Waste Collection & Monitoring</div>
          <h1>Cleaner streets.<br /><span>Smarter collection.</span></h1>
          <p>SWCMS monitors public waste bins, prioritizes collection, manages complaints and gives authorities one place to act on real-time waste conditions.</p>
          <div className="hero-actions">
            <Link to="/complaint" className="btn btn-primary btn-lg">Report an issue <ArrowRight size={18} /></Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Authority portal</Link>
          </div>
          <div className="hero-trust"><CheckCircle2 size={16} /> Public complaints require no login</div>
        </div>
        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="preview-top">
              <span>Live waste overview</span>
              <span className="live-dot" style={{ animation: "pulse 1.5s infinite" }}>● Live Telemetry</span>
            </div>
            <div className="preview-number">{metrics.efficiency}<span>%</span></div>
            <p>Collection efficiency</p>
            <div className="mini-bars" style={{ alignItems: "flex-end", height: "65px", gap: "6px" }}>
              {metrics.bins.map((v, i) => (
                <div
                  key={i}
                  style={{
                    height: `${Math.max(8, v)}%`,
                    background: v >= 85 ? "#c93f3f" : v >= 70 ? "#b77816" : "var(--primary)",
                    borderRadius: "3px",
                    transition: "height 0.6s ease"
                  }}
                  title={`Bin Sensor #${i+1}: ${v}%`}
                />
              ))}
            </div>
            <div className="preview-alert">
              <BellRing size={17} color={metrics.attentionCount > 0 ? "#c93f3f" : "var(--primary)"} />
              <div>
                <b>{metrics.attentionCount} {metrics.attentionCount === 1 ? "bin needs" : "bins need"} attention</b>
                <span>Prioritized automatically</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-heading"><span>CORE CAPABILITIES</span><h2>One system for the complete waste workflow</h2></div>
        <div className="feature-grid">
          {[
            [Trash2, "Smart bin monitoring", "Track fill levels and identify bins that require collection."],
            [BellRing, "Priority alerts", "Surface critical bins first so collection teams can respond efficiently."],
            [MapPin, "Location-aware operations", "Connect each bin to a unique ID and physical location."],
            [Smartphone, "Citizen complaints", "Let citizens report waste issues and track complaint progress."],
            [BarChart3, "Reports & analytics", "Understand collection activity, waste levels and operational trends."],
            [ShieldCheck, "Role-based portals", "Separate administrator controls from authority operations."]
          ].map(([Icon, title, text]) => (
            <div className="feature-card" key={title}><div className="feature-icon"><Icon size={21} /></div><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="workflow section">
        <div className="section-heading"><span>WORKFLOW</span><h2>From bin sensor to collection record</h2></div>
        <div className="steps">
          {[
            ["01", "Monitor", "Waste level data enters the system for each registered bin."],
            ["02", "Detect", "Thresholds and operational rules generate alerts."],
            ["03", "Prioritize", "Authorities see which bins require attention first."],
            ["04", "Collect", "Collection activity is recorded for accountability and reports."]
          ].map(([num, title, text]) => <div className="step" key={num}><b>{num}</b><h3>{title}</h3><p>{text}</p></div>)}
        </div>
      </section>

      <footer className="landing-footer"><div><Recycle size={18} /> SWCMS</div><span>Smart Waste Collection & Monitoring System</span></footer>
    </div>
  );
}