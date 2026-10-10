import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Copy, Send, Sparkles, MapPin, Tag, Phone, Mail, User } from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { binService } from "../../services/binService";

const CATEGORIES = [
  "Overflowing Garbage",
  "Damaged Bin",
  "Bad Odor",
  "Illegal Dumping",
  "Sensor Failure",
  "Others"
];

export default function ComplaintPage() {
  const [formData, setFormData] = useState({
    citizen_name: "",
    citizen_email: "",
    citizen_phone: "",
    category: "Overflowing Garbage",
    description: "",
    location: "",
    bin_id: ""
  });
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    binService.list().then(res => {
      if (res?.bins) setBins(res.bins);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        citizen_name: formData.citizen_name,
        citizen_email: formData.citizen_email || null,
        citizen_phone: formData.citizen_phone || null,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        bin_id: formData.bin_id ? parseInt(formData.bin_id) : null
      };

      const res = await complaintService.submit(payload);
      if (res?.complaint_code) {
        setSubmittedId(res.complaint_code);
      } else {
        setError("Failed to obtain complaint tracking code.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  }

  function handleBinChange(e) {
    const selectedBinId = e.target.value;
    const found = bins.find(b => String(b.bin_id) === String(selectedBinId));
    setFormData(prev => ({
      ...prev,
      bin_id: selectedBinId,
      location: found ? found.location : prev.location
    }));
  }

  function copyCode() {
    if (submittedId) {
      navigator.clipboard.writeText(submittedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="public-form-page">
      <Link to="/" className="public-back">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="public-card">
        {submittedId ? (
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle2 size={38} />
            </div>
            <h1>Complaint Registered Successfully!</h1>
            <p>
              Thank you for contributing to a cleaner neighborhood. Your complaint has been automatically routed to the municipal response team.
            </p>

            <div className="complaint-id-box">
              <span>UNIQUE COMPLAINT TRACKING ID</span>
              <strong>{submittedId}</strong>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={copyCode}
                style={{ marginTop: "10px", width: "100%" }}
              >
                <Copy size={14} /> {copied ? "Copied to Clipboard!" : "Copy Tracking ID"}
              </button>
            </div>

            <div className="form-actions">
              <Link to={`/track-complaint?code=${submittedId}`} className="btn btn-primary">
                Track Status Now
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSubmittedId(null);
                  setFormData({
                    citizen_name: "",
                    citizen_email: "",
                    citizen_phone: "",
                    category: "Overflowing Garbage",
                    description: "",
                    location: "",
                    bin_id: ""
                  });
                }}
              >
                Submit Another Issue
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="form-heading">
              <span className="eyebrow">PUBLIC COMPLAINT PORTAL</span>
              <h1>Report a Waste Issue</h1>
              <p>
                Citizens can directly report overflowing bins, damaged equipment, or illegal dumping without an account.
              </p>
            </div>

            {error && <div className="form-error" style={{ marginBottom: "14px" }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>
                    Full Name *
                    <div className="input-wrap">
                      <User size={15} />
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.citizen_name}
                        onChange={e => setFormData({ ...formData, citizen_name: e.target.value })}
                      />
                    </div>
                  </label>
                </div>

                <div>
                  <label>
                    Email Address (Optional)
                    <div className="input-wrap">
                      <Mail size={15} />
                      <input
                        type="email"
                        placeholder="For status updates"
                        value={formData.citizen_email}
                        onChange={e => setFormData({ ...formData, citizen_email: e.target.value })}
                      />
                    </div>
                  </label>
                </div>

                <div>
                  <label>
                    Phone Number (Optional)
                    <div className="input-wrap">
                      <Phone size={15} />
                      <input
                        type="tel"
                        placeholder="Contact number"
                        value={formData.citizen_phone}
                        onChange={e => setFormData({ ...formData, citizen_phone: e.target.value })}
                      />
                    </div>
                  </label>
                </div>

                <div>
                  <label>
                    Issue Category *
                    <div className="input-wrap">
                      <Tag size={15} />
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        style={{ border: 0, padding: "10px 0", background: "transparent", width: "100%" }}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>

                <div>
                  <label>
                    Associated Bin (Optional)
                    <div className="input-wrap">
                      <select
                        value={formData.bin_id}
                        onChange={handleBinChange}
                        style={{ border: 0, padding: "10px 0", background: "transparent", width: "100%" }}
                      >
                        <option value="">-- Select nearby bin or leave blank --</option>
                        {bins.map(b => (
                          <option key={b.bin_id} value={b.bin_id}>
                            {b.bin_code} - {b.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>

                <div>
                  <label>
                    Location / Landmark *
                    <div className="input-wrap">
                      <MapPin size={15} />
                      <input
                        type="text"
                        required
                        placeholder="Street, landmark, or area"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </label>
                </div>

                <div className="span-2">
                  <label>
                    Detailed Description *
                    <textarea
                      required
                      rows={4}
                      placeholder="Please describe the condition (e.g. overflow level, spillages, odor, broken lids)..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="form-notice">
                <Sparkles size={16} />
                <span>Submitted issues are automatically prioritized and monitored by municipal field authorities.</span>
              </div>

              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                <Send size={16} /> {loading ? "Registering Complaint..." : "Submit Complaint"}
              </button>
            </form>

            <div className="form-footer">
              Already submitted an issue? <Link to="/track-complaint">Track your complaint here →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
