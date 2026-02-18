import { useEffect, useState } from "react";
import api from "../services/api";
import AdminLeaderboard from "../components/AdminLeaderboard";
import AdminReports from "./AdminReports";
import AdminUsers from "./AdminUsers";
import {
  getTopContributors,
  getMostTagged
} from "../services/admin";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [topContributor, setTopContributor] = useState(null);
  const [mostTagged, setMostTagged] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    getTopContributors().then(res =>
      setTopContributor(res.data?.[0])
    );
    getMostTagged().then(res =>
      setMostTagged(res.data?.[0])
    );
    api.get("/api/shoutouts").then(res =>
      setTotalCount(res.data?.length || 0)
    );
  }, []);

  return (
    <div className="admin-page">
      {/* HEADER */}

      {/* TABS */}
      <div className="admin-tabs">
        <button
          className={activeTab === "analytics" ? "tab active" : "tab"}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
        <button
          className={activeTab === "reports" ? "tab active" : "tab"}
          onClick={() => setActiveTab("reports")}
        >
          🚩 Reports
        </button>
        <button
          className={activeTab === "users" ? "tab active" : "tab"}
          onClick={() => setActiveTab("users")}
        >
          👥 User Management
        </button>
      </div>

      {/* ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="analytics-card">

          <AdminLeaderboard />
        </div>
      )}

      {/* REPORTS */}
      {activeTab === "reports" && <AdminReports />}

      {/* USERS */}
      {activeTab === "users" && <AdminUsers />}
    </div>
  );
}
