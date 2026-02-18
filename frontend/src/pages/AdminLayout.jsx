import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import {
  getTopContributors,
  getMostTagged
} from "../services/admin";

export default function AdminLayout() {
  const navigate = useNavigate();

  const [topContributor, setTopContributor] = useState(null);
  const [mostTagged, setMostTagged] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    getTopContributors().then(res =>
      setTopContributor(res.data?.[0] || null)
    );

    getMostTagged().then(res =>
      setMostTagged(res.data?.[0] || null)
    );

    api.get("/api/shoutouts").then(res =>
      setTotalCount(res.data?.length || 0)
    );
  }, []);

  return (
    <div className="admin-app">
      <div className="admin-content">

        {/* HEADER */}
        <div className="dashboard-header-row">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtext">Welcome, Admin</p>
          </div>

          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ⬅ Back to Dashboard
          </button>
        </div>

        {/* STATS */}
        <div className="stats-row">
          <div className="stat-card">
            <b>TOTAL SHOUTOUTS 📣</b>
            <p>{totalCount}</p>
            <small>Shoutouts</small>
          </div>

          <div className="stat-card">
            <b>TOP CONTRIBUTOR 🔥</b>
            <p>{topContributor?.full_name || "-"}</p>
            <small>{topContributor?.count || 0} shoutouts</small>
          </div>

          <div className="stat-card">
            <b>MOST TAGGED 🏷️</b>
            <p>{mostTagged?.full_name || "-"}</p>
            <small>{mostTagged?.count || 0} tags</small>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <Outlet />

      </div>
    </div>
  );
}
