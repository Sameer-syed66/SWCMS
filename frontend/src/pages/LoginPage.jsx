import { LockKeyhole, Mail, ShieldCheck, Trash2, UserRound, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [role, setRole] = useState("authority");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, role);
      navigate(role === "admin" ? "/admin" : "/authority");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(type) {
    if (type === "admin") {
      setRole("admin");
      setEmail("admin");
      setPassword("Admin@123");
    } else {
      setRole("authority");
      setEmail("authority1");
      setPassword("Authority@123");
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-mark">S</div>
        <div><strong>SWCMS</strong><span>Smart Waste Management</span></div>
      </div>
      <div className="login-shell">
        <div className="login-side">
          <div className="login-side-content">
            <Trash2 size={38} />
            <h1>Smart decisions for cleaner communities.</h1>
            <p>Monitor bins, respond to alerts, manage complaints and maintain collection records from one operational portal.</p>
            <div className="login-points">
              <span><ShieldCheck size={16}/> Role-based access control</span>
              <span><ShieldCheck size={16}/> Real-time sensor monitoring</span>
              <span><ShieldCheck size={16}/> Documented collection history</span>
            </div>
          </div>
        </div>
        <div className="login-form-wrap">
          <div className="form-heading">
            <span>SECURE PORTAL</span>
            <h2>Welcome back</h2>
            <p>Sign in to your role-based SWCMS dashboard.</p>
          </div>
          <div className="role-switch">
            <button
              type="button"
              className={role === "authority" ? "selected" : ""}
              onClick={() => setRole("authority")}
            >
              <UserRound size={17}/> Authority
            </button>
            <button
              type="button"
              className={role === "admin" ? "selected" : ""}
              onClick={() => setRole("admin")}
            >
              <ShieldCheck size={17}/> Administrator
            </button>
          </div>
          <form onSubmit={submit}>
            <label>
              Username or Email
              <div className="input-wrap">
                <Mail size={17}/>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin or admin@swcms.com" : "authority1 or rahul@swcms.com"}
                  required
                />
              </div>
            </label>
            <label>
              Password
              <div className="input-wrap">
                <LockKeyhole size={17}/>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </label>
            {error && (
              <div className="form-error" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : `Sign in as ${role === "admin" ? "Administrator" : "Authority"}`}
            </button>
          </form>

          <div style={{ marginTop: "16px", display: "flex", gap: "8px", justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo("admin")}
              title="Fill demo administrator credentials"
            >
              Demo Admin
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo("authority")}
              title="Fill demo authority credentials"
            >
              Demo Authority
            </button>
          </div>

          <p className="login-note">Public citizens can submit complaints without logging in.</p>
          <Link to="/" className="back-link">← Back to public website</Link>
        </div>
      </div>
    </div>
  );
}