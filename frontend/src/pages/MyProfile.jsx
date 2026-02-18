import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function MyProfile() {
  const { user } = useContext(AuthContext);

  // 🔐 ADMIN VIEW
  if (user.role === "admin") {
    return <AdminProfile />;
  }

  // 👤 EMPLOYEE VIEW
  return <EmployeeProfile user={user} />;
}

/* =====================================================
   👤 EMPLOYEE PROFILE
===================================================== */

function EmployeeProfile({ user }) {
  const [stats, setStats] = useState({
    posted: 0,
    tagged: 0,
    comments: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const normalize = (v) => v?.toLowerCase().trim();

  const loadStats = async () => {
    const res = await api.get("/api/shoutouts");
    const data = res.data || [];
    const name = normalize(user.full_name);

    const posted = data.filter(
      (s) => normalize(s.sender_name) === name
    ).length;

    const tagged = data.filter((s) =>
      s.recipients?.some((r) => normalize(r) === name)
    ).length;

    let comments = 0;
    data.forEach((s) =>
      s.comments?.forEach((c) => {
        if (normalize(c.user_name) === name) comments++;
      })
    );

    setStats({ posted, tagged, comments });
  };

  return (
    <div className="profile-center">
      <div className="profile-card-pro">

        {/* HEADER */}
        <div className="profile-header-pro">
          <div className="profile-avatar-pro">
            {user.full_name
              .split(" ")
              .map((x) => x[0])
              .join("")}
          </div>

          <h2 className="profile-name-pro">{user.full_name}</h2>
          <p className="profile-meta-pro">
            {user.department} · {user.role}
          </p>
        </div>

        {/* STATS */}
        <div className="profile-stats-pro">
          <Stat value={stats.posted} label="Posted" color="blue" />
          <Stat value={stats.tagged} label="Tagged" color="green" />
         
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   🛠️ ADMIN PROFILE (SUMMARY + ORG OVERVIEW)
===================================================== */

function AdminProfile() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [shoutoutCounts, setShoutoutCounts] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const usersRes = await api.get("/api/users");
    const shoutoutsRes = await api.get("/api/shoutouts");

    const employees = (usersRes.data.users || []).filter(
      (u) => u.role === "employee"
    );

    const countMap = {};
    shoutoutsRes.data?.forEach((s) => {
      countMap[s.sender_name] =
        (countMap[s.sender_name] || 0) + 1;
    });

    setUsers(employees);
    setShoutoutCounts(countMap);
  };

  /* GROUP USERS BY DEPARTMENT */
  const grouped = users.reduce((acc, u) => {
    acc[u.department] = acc[u.department] || [];
    acc[u.department].push(u);
    return acc;
  }, {});

  const totalDepartments = Object.keys(grouped).length;

  return (
    <div className="admin-profile-wrapper">

      {/* 🔝 ADMIN SUMMARY HEADER */}
      <div className="admin-summary-card">
        <div className="admin-summary-left">
          <div className="admin-avatar-lg">
            {user.full_name
              .split(" ")
              .map((x) => x[0])
              .join("")}
          </div>

          <div>
            <h2>{user.full_name}</h2>
            <p className="admin-meta">
              System Administrator
            </p>
          </div>
        </div>

        <div className="admin-summary-stats">
          <SummaryStat label="  Total Users  " value={users.length + 1} />
          <SummaryStat label="  Employees  " value={users.length} />
          <SummaryStat label="  Departments  " value={totalDepartments} />
        </div>
      </div>
      <br></br>
      {/* ORG OVERVIEW */}
      <h2 className="admin-profile-title">
        Organization Overview
      </h2>

      {Object.entries(grouped).map(([dept, list]) => (
        <div key={dept} className="admin-dept-section">
          <h3 className="admin-dept-title">{dept}</h3>

          <div className="admin-user-grid">
            {list.map((u) => (
              <div key={u.id} className="admin-user-card">
                <div className="admin-avatar">
                  {u.full_name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </div>

                <b>{u.full_name}</b>
                <span className="admin-role">
                  {u.role}
                </span>

                <div className="admin-count">
                  {shoutoutCounts[u.full_name] || 0} Shoutouts
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}

/* =====================================================
   🔁 SHARED COMPONENTS
===================================================== */

function Stat({ value, label, color }) {
  return (
    <div className="stat-pro">
      <span className={`stat-number ${color}`}>
        {value}
      </span>
      <span className="stat-text">{label}</span>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="admin-summary-stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}
