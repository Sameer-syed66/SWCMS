import { LockKeyhole, Mail, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [role, setRole] = useState("authority");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password, role);
      navigate(role === "admin" ? "/admin" : "/authority");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand"><div className="brand-mark">S</div><div><strong>SWCMS</strong><span>Smart Waste Management</span></div></div>
      <div className="login-shell">
        <div className="login-side">
          <div className="login-side-content">
            <Trash2 size={38} />
            <h1>Smart decisions for cleaner communities.</h1>
            <p>Monitor bins, respond to alerts, manage complaints and maintain collection records from one operational portal.</p>
            <div className="login-points"><span><ShieldCheck size={16}/> Role-based access</span><span><ShieldCheck size={16}/> Centralized monitoring</span><span><ShieldCheck size={16}/> Collection history</span></div>
          </div>
        </div>
        <div className="login-form-wrap">
          <div className="form-heading"><span>SECURE PORTAL</span><h2>Welcome back</h2><p>Sign in to continue to SWCMS.</p></div>
          <div className="role-switch">
            <button className={role === "authority" ? "selected" : ""} onClick={() => setRole("authority")}><UserRound size={17}/> Authority</button>
            <button className={role === "admin" ? "selected" : ""} onClick={() => setRole("admin")}><ShieldCheck size={17}/> Administrator</button>
          </div>
          <form onSubmit={submit}>
            <label>Email address<div className="input-wrap"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required /></div></label>
            <label>Password<div className="input-wrap"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required /></div></label>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-primary btn-full" type="submit">Sign in</button>
          </form>
          <p className="login-note">Development UI: authentication is ready to connect to the Flask API.</p>
          <Link to="/" className="back-link">← Back to public website</Link>
        </div>
      </div>
    </div>
  );
}