import { AlertTriangle, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function AlertCard({ alert, onAction }) {
  return (
    <div className="alert-card">
      <div className={`alert-icon ${alert.severity.toLowerCase()}`}><AlertTriangle size={18} /></div>
      <div className="alert-content">
        <div className="alert-title-row"><strong>{alert.title}</strong><StatusBadge status={alert.severity} /></div>
        <p><b>{alert.bin}</b> · <MapPin size={13} /> {alert.location}</p>
        <small>{alert.level}% full · {alert.time}</small>
      </div>
      {onAction && <button className="btn btn-outline btn-sm" onClick={() => onAction(alert)}>Review</button>}
    </div>
  );
}