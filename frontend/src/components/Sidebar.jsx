import { BarChart3, Bell, Boxes, ClipboardList, FileBarChart, Gauge, History, Home, LogOut, MessageSquareWarning, ShieldCheck, Truck, Users, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  ["/admin", "Dashboard", Gauge],
  ["/admin/authorities", "Authorities", Users],
  ["/admin/bins", "Manage Bins", Boxes],
  ["/admin/reports", "Reports", FileBarChart],
  ["/admin/analytics", "Analytics", BarChart3]
];

const authorityLinks = [
  ["/authority", "Dashboard", Gauge],
  ["/authority/alerts", "Alerts", Bell],
  ["/authority/complaints", "Complaints", MessageSquareWarning],
  ["/authority/bins", "Bin Status", Boxes],
  ["/authority/collection", "Collection", Truck],
  ["/authority/history", "History", History]
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "admin" ? adminLinks : authorityLinks;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div><strong>SWCMS</strong><span>Smart Waste Management</span></div>
      </div>

      <div className="role-banner">
        <ShieldCheck size={16} />
        <span>{user?.role === "admin" ? "Administrator" : "Authority Portal"}</span>
      </div>

      <nav className="side-nav">
        <span className="nav-label">MAIN MENU</span>
        {links.map(([path, label, Icon]) => (
          <NavLink key={path} to={path} end={path === "/admin" || path === "/authority"} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item logout-link" onClick={() => { logout(); navigate("/"); }}>
          <LogOut size={19} /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
}