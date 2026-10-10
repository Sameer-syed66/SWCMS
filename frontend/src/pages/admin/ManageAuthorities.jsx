import { useState, useEffect } from "react";
import { Plus, Search, ShieldCheck, UserCheck, UserX, X, Mail, Phone, MapPin } from "lucide-react";
import { reportService } from "../../services/reportService";
import Loading from "../../components/Loading";

export default function ManageAuthorities() {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newAuth, setNewAuth] = useState({
    username: "",
    password: "Authority@123",
    full_name: "",
    email: "",
    phone: "",
    area: "Central Zone"
  });

  useEffect(() => {
    loadAuthorities();
  }, []);

  async function loadAuthorities() {
    setLoading(true);
    try {
      const res = await reportService.getAuthorities();
      if (res?.authorities) setAuthorities(res.authorities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await reportService.createAuthority(newAuth);
      setShowModal(false);
      setNewAuth({
        username: "",
        password: "Authority@123",
        full_name: "",
        email: "",
        phone: "",
        area: "Central Zone"
      });
      loadAuthorities();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create authority.");
    }
  }

  async function handleToggleStatus(auth) {
    const nextStatus = auth.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await reportService.toggleAuthorityStatus(auth.authority_id, nextStatus);
      loadAuthorities();
    } catch (err) {
      alert("Failed to update status.");
    }
  }

  async function handleApprove(auth) {
    try {
      await reportService.approveAuthority(auth.authority_id);
      loadAuthorities();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to approve authority.");
    }
  }

  async function handleReject(auth) {
    if (!window.confirm(`Are you sure you want to reject and remove registration for ${auth.full_name}?`)) return;
    try {
      await reportService.rejectAuthority(auth.authority_id);
      loadAuthorities();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject authority.");
    }
  }

  const pendingAuthorities = authorities.filter(a => a.status === "INACTIVE");

  const filtered = authorities.filter(a =>
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.username.toLowerCase().includes(search.toLowerCase()) ||
    (a.area && a.area.toLowerCase().includes(search.toLowerCase())) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-section">
      <div className="page-actions">
        <div>
          <span className="eyebrow">FIELD TEAMS & USER ROLES</span>
          <h2>Manage Municipal Authorities</h2>
          <p>Supervise authorized waste collection officers, dispatch zones, and system credentials.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Authority
        </button>
      </div>

      {pendingAuthorities.length > 0 && (
        <div style={{
          background: "#fff9f0",
          border: "1px solid #f6d299",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{
              background: "#d97706",
              color: "#fff",
              fontSize: "10px",
              fontWeight: "700",
              borderRadius: "4px",
              padding: "2px 6px"
            }}>APPROVAL REQUIRED</span>
            <strong style={{ fontSize: "14px", color: "#92400e" }}>
              New Authority Registration Requests ({pendingAuthorities.length})
            </strong>
          </div>
          <p style={{ fontSize: "12px", color: "#78350f", margin: "0 0 14px" }}>
            New field officers have requested operational access. Review and approve their requests to grant them login permissions.
          </p>

          <div style={{ display: "grid", gap: "10px" }}>
            {pendingAuthorities.map(pa => (
              <div key={pa.authority_id} style={{
                background: "#fff",
                border: "1px solid #fed7aa",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "13px" }}>{pa.full_name}</strong>
                    <code style={{ fontSize: "11px", background: "#f3f4f6", padding: "1px 6px", borderRadius: "4px" }}>
                      @{pa.username}
                    </code>
                    <span style={{ fontSize: "11px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <MapPin size={12} color="var(--primary)" /> {pa.area || "Central Zone"}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", display: "flex", gap: "12px" }}>
                    <span><Mail size={11} style={{ display: "inline" }} /> {pa.email}</span>
                    {pa.phone && <span><Phone size={11} style={{ display: "inline" }} /> {pa.phone}</span>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleApprove(pa)}
                    title="Approve registration and enable login"
                  >
                    <UserCheck size={14} /> Approve & Activate
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ borderColor: "#f87171", color: "#dc2626" }}
                    onClick={() => handleReject(pa)}
                    title="Reject and remove this registration"
                  >
                    <UserX size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by officer name, username, or area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-count">
          Showing <b>{filtered.length}</b> of <b>{authorities.length}</b> officers
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Officer</th>
                <th>Username</th>
                <th>Assigned Zone</th>
                <th>Contact Details</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.authority_id}>
                  <td>
                    <div className="table-person">
                      <div className="avatar">
                        {a.full_name.charAt(0)}
                      </div>
                      <div>
                        <strong>{a.full_name}</strong>
                        <span>Officer ID #{a.authority_id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code>{a.username}</code>
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                      <MapPin size={13} color="var(--primary)" /> {a.area || "All Zones"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                      <div><Mail size={11} style={{ display: "inline" }} /> {a.email}</div>
                      {a.phone && <div><Phone size={11} style={{ display: "inline" }} /> {a.phone}</div>}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${a.status === "ACTIVE" ? "active" : "critical"}`}>
                      {a.status === "ACTIVE" ? "ACTIVE" : "PENDING APPROVAL"}
                    </span>
                  </td>
                  <td>
                    {a.status === "ACTIVE" ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleToggleStatus(a)}
                      >
                        <UserX size={13} /> Deactivate
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleApprove(a)}
                          title="Approve and activate"
                        >
                          <UserCheck size={13} /> Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          style={{ borderColor: "#f87171", color: "#dc2626" }}
                          onClick={() => handleReject(a)}
                          title="Reject request"
                        >
                          <UserX size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header" style={{ marginBottom: "15px" }}>
              <h3>Register Municipal Authority</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <label>
                Full Name *
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={newAuth.full_name}
                  onChange={e => setNewAuth({ ...newAuth, full_name: e.target.value })}
                />
              </label>
              <label>
                Username *
                <input
                  type="text"
                  required
                  placeholder="e.g. authority4"
                  value={newAuth.username}
                  onChange={e => setNewAuth({ ...newAuth, username: e.target.value })}
                />
              </label>
              <label>
                Password *
                <input
                  type="password"
                  required
                  value={newAuth.password}
                  onChange={e => setNewAuth({ ...newAuth, password: e.target.value })}
                />
              </label>
              <label>
                Email Address *
                <input
                  type="email"
                  required
                  placeholder="ramesh@swcms.com"
                  value={newAuth.email}
                  onChange={e => setNewAuth({ ...newAuth, email: e.target.value })}
                />
              </label>
              <label>
                Phone Number
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={newAuth.phone}
                  onChange={e => setNewAuth({ ...newAuth, phone: e.target.value })}
                />
              </label>
              <label>
                Assigned Operational Area
                <select
                  value={newAuth.area}
                  onChange={e => setNewAuth({ ...newAuth, area: e.target.value })}
                >
                  <option value="Central Zone">Central Zone</option>
                  <option value="North Zone">North Zone</option>
                  <option value="South Zone">South Zone</option>
                  <option value="East Zone">East Zone</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
