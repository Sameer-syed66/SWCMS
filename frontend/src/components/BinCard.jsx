import { MapPin, Radio } from "lucide-react";
import { levelClass } from "../utils/formatters";
import StatusBadge from "./StatusBadge";

export default function BinCard({ bin, onClick }) {
  const cls = levelClass(bin.level);
  return (
    <button className="bin-card" onClick={() => onClick?.(bin)}>
      <div className="bin-card-head">
        <div><strong>{bin.id}</strong><span><MapPin size={13} /> {bin.location}</span></div>
        <StatusBadge status={bin.status} />
      </div>
      <div className="level-row">
        <span>Waste level</span><strong>{bin.level}%</strong>
      </div>
      <div className="progress-track"><div className={`progress-fill ${cls}`} style={{ width: `${bin.level}%` }} /></div>
      <div className="bin-card-foot"><span><Radio size={13} /> Live sensor</span><span>{bin.lastUpdated}</span></div>
    </button>
  );
}