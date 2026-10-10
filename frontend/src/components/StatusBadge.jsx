export default function StatusBadge({ status }) {
  const cls = String(status || "").toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge ${cls}`}>{status}</span>;
}