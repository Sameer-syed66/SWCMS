import { LockKeyhole, Mail, ShieldCheck, Trash2, UserRound, AlertCircle, UserPlus, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

export default function LoginPage() {
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [role, setRole] = useState("authority");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Signup form state
  const [signupData, setSignupData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    area: "Central Zone",
    password: "",
    confirmPassword: ""
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
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

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match. Please verify both passwords.");
      return;
    }

    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await authService.registerAuthority({
        full_name: signupData.full_name,
        username: signupData.username,
        email: signupData.email,
        phone: signupData.phone,
        area: signupData.area,
        password: signupData.password
      });
      setSignupSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to submit authority registration.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemoAuthority() {
    setRole("authority");
    setEmail("authority1");
    setPassword("Authority@123");
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
              <span><ShieldCheck size={16}/> Administrator verification for field officers</span>
            </div>
          </div>
        </div>

        <div className="login-form-wrap">
          {authMode === "signup" ? (
            <div>
              {signupSuccess ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#e4f5eb",
                    color: "#18794e",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 16px"
                  }}>
                    <CheckCircle2 size={34} />
                  </div>
                  <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "10px", color: "var(--text)" }}>
                    Registration Submitted!
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.6", marginBottom: "20px" }}>
                    Your authority account request has been submitted and a notification has been sent to the <strong>Administrator</strong>.
                    Once approved and activated by the administrator, you will be able to log in with your credentials.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={() => {
                      setSignupSuccess(false);
                      setAuthMode("login");
                      setRole("authority");
                      setEmail(signupData.username);
                      setPassword("");
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <div>
                  <div className="form-heading">
                    <span>MUNICIPAL OFFICER ACCESS</span>
                    <h2>Register as Authority</h2>
                    <p>Submit your details for field officer verification and administrative approval.</p>
                  </div>

                  <form onSubmit={handleSignup}>
                    <label>
                      Full Name
                      <div className="input-wrap">
                        <UserRound size={16}/>
                        <input
                          type="text"
                          value={signupData.full_name}
                          onChange={e => setSignupData({ ...signupData, full_name: e.target.value })}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label>
                        Officer Username
                        <div className="input-wrap">
                          <UserPlus size={16}/>
                          <input
                            type="text"
                            value={signupData.username}
                            onChange={e => setSignupData({ ...signupData, username: e.target.value })}
                            placeholder="Choose a username"
                            required
                          />
                        </div>
                      </label>

                      <label>
                        Contact Phone
                        <div className="input-wrap">
                          <Phone size={16}/>
                          <input
                            type="tel"
                            value={signupData.phone}
                            onChange={e => setSignupData({ ...signupData, phone: e.target.value })}
                            placeholder="Phone number (optional)"
                          />
                        </div>
                      </label>
                    </div>

                    <label>
                      Email Address
                      <div className="input-wrap">
                        <Mail size={16}/>
                        <input
                          type="email"
                          value={signupData.email}
                          onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </label>

                    <label>
                      Assigned Municipal Zone
                      <div className="input-wrap">
                        <MapPin size={16}/>
                        <select
                          value={signupData.area}
                          onChange={e => setSignupData({ ...signupData, area: e.target.value })}
                          style={{ border: "none", outline: "none", background: "transparent", width: "100%", padding: "10px 0" }}
                        >
                          <option value="Central Zone">Central Zone</option>
                          <option value="North Zone">North Zone</option>
                          <option value="South Zone">South Zone</option>
                          <option value="East Zone">East Zone</option>
                          <option value="West Zone">West Zone</option>
                        </select>
                      </div>
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label>
                        Password
                        <div className="input-wrap">
                          <LockKeyhole size={16}/>
                          <input
                            type="password"
                            value={signupData.password}
                            onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                            placeholder="Enter password (min 6 chars)"
                            required
                          />
                        </div>
                      </label>

                      <label>
                        Confirm Password
                        <div className="input-wrap">
                          <LockKeyhole size={16}/>
                          <input
                            type="password"
                            value={signupData.confirmPassword}
                            onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                            placeholder="Confirm your password"
                            required
                          />
                        </div>
                      </label>
                    </div>

                    {error && (
                      <div className="form-error" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <AlertCircle size={15} />
                        <span>{error}</span>
                      </div>
                    )}

                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                      {loading ? "Submitting Registration..." : "Submit Registration Request"}
                    </button>
                  </form>

                  <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "var(--muted)" }}>
                    Already have an approved account?{" "}
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", cursor: "pointer", padding: 0 }}
                      onClick={() => { setAuthMode("login"); setError(""); }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="form-heading">
                <span>SECURE PORTAL</span>
                <h2>Welcome back</h2>
                <p>Sign in to your role-based SWCMS dashboard.</p>
              </div>

              <div className="role-switch">
                <button
                  type="button"
                  className={role === "authority" ? "selected" : ""}
                  onClick={() => { setRole("authority"); setError(""); setEmail(""); setPassword(""); }}
                >
                  <UserRound size={17}/> Authority
                </button>
                <button
                  type="button"
                  className={role === "admin" ? "selected" : ""}
                  onClick={() => { setRole("admin"); setError(""); setEmail(""); setPassword(""); }}
                >
                  <ShieldCheck size={17}/> Administrator
                </button>
              </div>

              <form onSubmit={handleLogin}>
                <label>
                  {role === "admin" ? "Admin Username or Email" : "Officer Username or Email"}
                  <div className="input-wrap">
                    <Mail size={17}/>
                    <input
                      type="text"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your username or email"
                      autoComplete="username"
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
                      autoComplete="current-password"
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

              {role === "authority" && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={fillDemoAuthority}
                    title="Fill demo authority credentials"
                  >
                    Demo Authority
                  </button>

                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                    New field officer?{" "}
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", cursor: "pointer", padding: 0 }}
                      onClick={() => { setAuthMode("signup"); setError(""); }}
                    >
                      Sign up as Authority
                    </button>
                  </div>
                </div>
              )}

              <p className="login-note">Public citizens can submit complaints without logging in.</p>
              <div style={{ textAlign: "center" }}>
                <Link to="/" className="back-link">← Back to public website</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}