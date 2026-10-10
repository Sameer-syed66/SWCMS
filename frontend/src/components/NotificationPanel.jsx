import { Bell, CheckCircle2 } from "lucide-react";

export default function NotificationPanel({ notifications = [], onMarkRead }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h3>Recent Notifications</h3>
          <p>Real-time system alarms & grievance dispatches</p>
        </div>
        <Bell size={18} color="var(--primary)" />
      </div>
      <div className="notification-list">
        {notifications.length ? notifications.map((item) => (
          <div
            className="notification-item"
            key={item.id || item.notification_id}
            onClick={() => onMarkRead?.(item.id || item.notification_id)}
            style={{ cursor: onMarkRead ? "pointer" : "default" }}
          >
            <CheckCircle2 size={17} color={item.is_read ? "var(--muted)" : "var(--primary)"} />
            <div>
              <strong>{item.title}</strong>
              <span style={{ color: "var(--text)", margin: "3px 0" }}>{item.message}</span>
              <small style={{ color: "var(--muted)", fontSize: "9px" }}>{item.created_at || item.time || "Recently"}</small>
            </div>
          </div>
        )) : (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "11px" }}>
            No new notifications.
          </div>
        )}
      </div>
    </div>
  );
}