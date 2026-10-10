import { Bell, CheckCircle2 } from "lucide-react";

export default function NotificationPanel({ notifications = [] }) {
  return (
    <div className="panel">
      <div className="panel-header"><div><h3>Recent Notifications</h3><p>Latest system activity</p></div><Bell size={18} /></div>
      <div className="notification-list">
        {notifications.length ? notifications.map((item) => (
          <div className="notification-item" key={item.id}>
            <CheckCircle2 size={17} />
            <div><strong>{item.title}</strong><span>{item.time}</span></div>
          </div>
        )) : <div className="empty-state">No new notifications.</div>}
      </div>
    </div>
  );
}