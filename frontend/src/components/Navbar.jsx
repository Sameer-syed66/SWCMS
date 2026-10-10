import { Bell, Cpu, LogOut, Menu, UserCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const titles = {
  "/admin": "Admin Dashboard",
  "/admin/authorities": "Manage Authorities",
  "/admin/bins": "Manage Bins",
  "/admin/reports": "Reports",
  "/admin/analytics": "Analytics",
  "/authority": "Authority Dashboard",
  "/authority/alerts": "Alerts",
  "/authority/complaints": "Complaints",
  "/authority/bins": "Bin Status",
  "/authority/collection": "Collection",
  "/authority/history": "Collection History"
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="mobile-menu"><Menu size={21} /></div>
      <div>
        <div className="breadcrumb">SWCMS / {titles[location.pathname] || "Dashboard"}</div>
        <h1>{titles[location.pathname] || "Dashboard"}</h1>
      </div>
      <div className="topbar-actions">
        <Link
          to="/smart-bin"
          className="btn btn-outline btn-sm"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: "700",
            padding: "6px 12px",
            color: "var(--primary)",
            borderColor: "rgba(24, 121, 78, 0.3)",
            background: "rgba(24, 121, 78, 0.06)"
          }}
          title="Explore physical smart garbage bin hardware and IoT working mechanism"
        >
          <Cpu size={14} color="var(--primary)" /> Smart Bin
        </Link>
        <button className="icon-btn" onClick={() => navigate(user?.role === "admin" ? "/admin" : "/authority")}>
          <Bell size={19} />
          <span className="notification-dot" />
        </button>
        <div className="user-chip">
          <UserCircle size={27} />
          <div>
            <strong>{user?.name || "User"}</strong>
            <span>{user?.role || "guest"}</span>
          </div>
        </div>
        <button className="icon-btn" title="Logout" onClick={() => { logout(); navigate("/"); }}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}