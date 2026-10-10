export default function DashboardCard({ title, value, icon: Icon, tone = "", note, onClick }) {
  return (
    <button className={`dashboard-card ${tone}`} onClick={onClick} disabled={!onClick}>
      <div className="card-top">
        <span>{title}</span>
        <div className="card-icon"><Icon size={20} /></div>
      </div>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </button>
  );
}