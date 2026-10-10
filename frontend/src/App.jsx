import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageAuthorities from "./pages/admin/ManageAuthorities";
import ManageBins from "./pages/admin/ManageBins";
import Reports from "./pages/admin/Reports";
import Analytics from "./pages/admin/Analytics";
import AuthorityDashboard from "./pages/authority/AuthorityDashboard";
import Alerts from "./pages/authority/Alerts";
import Complaints from "./pages/authority/Complaints";
import BinStatus from "./pages/authority/BinStatus";
import Collection from "./pages/authority/Collection";
import CollectionHistory from "./pages/authority/CollectionHistory";
import ComplaintPage from "./pages/citizen/ComplaintPage";
import TrackComplaint from "./pages/citizen/TrackComplaint";
import SmartBinExplorer from "./pages/SmartBinExplorer";

function ProtectedLayout({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/authority"} replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Navbar />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/smart-bin" element={<SmartBinExplorer />} />
      <Route path="/complaint" element={<ComplaintPage />} />
      <Route path="/track-complaint" element={<TrackComplaint />} />

      <Route path="/admin" element={<ProtectedLayout roles={["admin"]}><AdminDashboard /></ProtectedLayout>} />
      <Route path="/admin/authorities" element={<ProtectedLayout roles={["admin"]}><ManageAuthorities /></ProtectedLayout>} />
      <Route path="/admin/bins" element={<ProtectedLayout roles={["admin"]}><ManageBins /></ProtectedLayout>} />
      <Route path="/admin/reports" element={<ProtectedLayout roles={["admin"]}><Reports /></ProtectedLayout>} />
      <Route path="/admin/analytics" element={<ProtectedLayout roles={["admin"]}><Analytics /></ProtectedLayout>} />

      <Route path="/authority" element={<ProtectedLayout roles={["authority"]}><AuthorityDashboard /></ProtectedLayout>} />
      <Route path="/authority/alerts" element={<ProtectedLayout roles={["authority"]}><Alerts /></ProtectedLayout>} />
      <Route path="/authority/complaints" element={<ProtectedLayout roles={["authority"]}><Complaints /></ProtectedLayout>} />
      <Route path="/authority/bins" element={<ProtectedLayout roles={["authority"]}><BinStatus /></ProtectedLayout>} />
      <Route path="/authority/collection" element={<ProtectedLayout roles={["authority"]}><Collection /></ProtectedLayout>} />
      <Route path="/authority/history" element={<ProtectedLayout roles={["authority"]}><CollectionHistory /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}