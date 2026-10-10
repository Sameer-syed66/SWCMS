import { useState, useEffect } from "react";
import { History, Search, Calendar, MapPin, Truck, CheckCircle2 } from "lucide-react";
import { collectionService } from "../../services/collectionService";
import Loading from "../../components/Loading";

export default function CollectionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await collectionService.getHistory();
      if (res?.collections) setHistory(res.collections);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = history.filter(h =>
    h.bin_code.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase()) ||
    (h.authority_name && h.authority_name.toLowerCase().includes(search.toLowerCase())) ||
    (h.remarks && h.remarks.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-section">
      <div className="page-actions">
        <div>
          <span className="eyebrow">FIELD ACTIVITY AUDIT TRAIL</span>
          <h2>Collection History Records</h2>
          <p>Chronological verification log of emptied bins, collected volume, driver timestamps, and field remarks.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by bin code, location, or officer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-count">
          Showing <b>{filtered.length}</b> records
        </div>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <div className="empty-panel">
          <CheckCircle2 size={36} color="var(--primary)" style={{ margin: "0 auto 10px" }} />
          <h3>No Records Found</h3>
          <p>No collection records match your criteria.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bin</th>
                <th>Location</th>
                <th>Collected Fill (%)</th>
                <th>Completed By</th>
                <th>Date & Time</th>
                <th>Field Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.collection_id}>
                  <td>
                    <strong>{r.bin_code}</strong>
                  </td>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} color="var(--primary)" /> {r.location}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: "700", color: "#c93f3f" }}>
                      {r.collected_level}% full
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: "600" }}>{r.authority_name}</span>
                  </td>
                  <td>
                    <small style={{ color: "var(--muted)" }}>{r.collected_at}</small>
                  </td>
                  <td>
                    <span style={{ fontSize: "11px", color: "var(--text)" }}>{r.remarks || "Emptied"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
