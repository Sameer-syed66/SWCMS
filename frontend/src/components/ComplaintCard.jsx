import { CalendarDays, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ComplaintCard({ complaint, onClick }) {
  return (
    <button className="complaint-card" onClick={() => onClick?.(complaint)}>
      <div className="complaint-id">{complaint.id}</div>
      <div className="complaint-main">
        <strong>{complaint.subject}</strong>
        <span><MapPin size={13} /> {complaint.location}</span>
        <span><CalendarDays size={13} /> {complaint.date}</span>
      </div>
      <StatusBadge status={complaint.status} />
    </button>
  );
}