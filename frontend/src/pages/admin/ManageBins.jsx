import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Activity, MapPin, CheckCircle, X, Sliders, Radio } from "lucide-react";
import { binService } from "../../services/binService";
import StatusBadge from "../../components/StatusBadge";
import Loading from "../../components/Loading";

export default function ManageBins() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [simLevel, setSimLevel] = useState(85);
  const [simMessage, setSimMessage] = useState("");

  const [newBin, setNewBin] = useState({
    bin_code: "",
    location: "",
    area: "Central Zone",
    capacity: 100,
    warning_threshold: 70,
    critical_threshold: 85
  });

  useEffect(() => {
    loadBins();
  }, []);

  async function loadBins() {
    setLoading(true);
    try {
      const res = await binService.list();
      if (res?.bins) setBins(res.bins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await binService.create(newBin);
      setShowAddModal(false);
      setNewBin({
        bin_code: "",
        location: "",
        area: "Central Zone",
        capacity: 100,
        warning_threshold: 70,
        critical_threshold: 85
      });
      loadBins();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create bin.");
    }
  }

  async function handleToggleStatus(bin) {
    const nextStatus = bin.operational_status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await binService.update(bin.bin_id, { operational_status: nextStatus });
      loadBins();
    } catch (err) {
      alert("Status update failed.");
    }
  }

  async function handleSimulateSubmit(e) {
    e.preventDefault();
    if (!selectedBin) return;
    try {
      const res = await binService.simulate(selectedBin.bin_id, parseFloat(simLevel));
      setSimMessage(`Sensor reading saved! Bin is now ${res.data?.waste_level}% (${res.data?.status}).`);
      loadBins();
    } catch (err) {
      setSimMessage("Failed to process reading.");
    }
  }

  const filtered = bins.filter(b => 
    b.bin_code.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase()) ||
    (b.area && b.area.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-section">
      <div className="page-actions">
        <div>
          <span className="eyebrow">EQUIPMENT & ASSET INVENTORY</span>
          <h2>Manage Garbage Bins</h2>
          <p>Register new sensor-equipped garbage bins, configure fill thresholds, and audit live telemetry.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Add New Bin
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by bin code, street or zone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-count">
          Showing <b>{filtered.length}</b> of <b>{bins.length}</b> bins
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bin Code</th>
                <th>Location / Zone</th>
                <th>Current Level</th>
                <th>Thresholds (Warn / Crit)</th>
                <th>Sensor Status</th>
                <th>Operational</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.bin_id}>
                  <td>
                    <strong>{b.bin_code}</strong>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600" }}>{b.location}</span>
                      <small style={{ color: "var(--muted)" }}><MapPin size={11} style={{ display: "inline" }} /> {b.area || "Zone"}</small>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700" }}>{b.current_level}%</span>
                      <div className="progress-track" style={{ width: "50px", margin: 0 }}>
                        <div
                          className={`progress-fill ${b.current_level >= b.critical_threshold ? "critical" : b.current_level >= b.warning_threshold ? "high" : "low"}`}
                          style={{ width: `${b.current_level}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                      <b>{b.warning_threshold}%</b> / <b>{b.critical_threshold}%</b>
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`status-badge ${b.operational_status === "ACTIVE" ? "active" : "pending"}`}
                      onClick={() => handleToggleStatus(b)}
                      title="Click to toggle Active/Inactive"
                      style={{ cursor: "pointer", border: 0 }}
                    >
                      {b.operational_status}
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedBin(b);
                          setSimLevel(b.current_level);
                          setSimMessage("");
                          setShowSimModal(true);
                        }}
                        title="Simulate Sensor Reading"
                      >
                        <Radio size={13} /> Simulate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Bin Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header" style={{ marginBottom: "15px" }}>
              <h3>Register New Garbage Bin</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <label>
                Bin Code *
                <input
                  type="text"
                  required
                  placeholder="e.g. BIN-011"
                  value={newBin.bin_code}
                  onChange={e => setNewBin({ ...newBin, bin_code: e.target.value })}
                />
              </label>
              <label>
                Physical Location *
                <input
                  type="text"
                  required
                  placeholder="e.g. Community Centre Entrance"
                  value={newBin.location}
                  onChange={e => setNewBin({ ...newBin, location: e.target.value })}
                />
              </label>
              <label>
                Operational Area / Zone
                <select
                  value={newBin.area}
                  onChange={e => setNewBin({ ...newBin, area: e.target.value })}
                >
                  <option value="Central Zone">Central Zone</option>
                  <option value="North Zone">North Zone</option>
                  <option value="South Zone">South Zone</option>
                  <option value="East Zone">East Zone</option>
                </select>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label>
                  Warning Threshold (%)
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newBin.warning_threshold}
                    onChange={e => setNewBin({ ...newBin, warning_threshold: e.target.value })}
                  />
                </label>
                <label>
                  Critical Threshold (%)
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newBin.critical_threshold}
                    onChange={e => setNewBin({ ...newBin, critical_threshold: e.target.value })}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Bin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {showSimModal && selectedBin && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header" style={{ marginBottom: "15px" }}>
              <div>
                <h3>Simulate Sensor: {selectedBin.bin_code}</h3>
                <p>{selectedBin.location}</p>
              </div>
              <button className="icon-btn" onClick={() => setShowSimModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSimulateSubmit}>
              <label>
                Sensor Waste Level: <strong>{simLevel}%</strong>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simLevel}
                  onChange={e => setSimLevel(e.target.value)}
                  style={{ marginTop: "12px" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)" }}>
                <span>0% Empty</span>
                <span>Warn: {selectedBin.warning_threshold}%</span>
                <span>Crit: {selectedBin.critical_threshold}%</span>
                <span>100% Full</span>
              </div>

              {simMessage && (
                <div style={{ background: "#e8f5ee", padding: "10px", borderRadius: "6px", fontSize: "11px", color: "#18794e", fontWeight: "600", marginTop: "10px" }}>
                  {simMessage}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSimModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Apply Reading</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
