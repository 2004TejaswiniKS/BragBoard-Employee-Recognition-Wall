import { useEffect, useState } from "react";
import {
  getTopContributors,
  getMostTagged
} from "../services/admin";

export default function AdminLeaderboard() {
  const [contributors, setContributors] = useState([]);
  const [tagged, setTagged] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cRes, tRes] = await Promise.all([
      getTopContributors(),
      getMostTagged()
    ]);

    setContributors(cRes.data || []);
    setTagged(tRes.data || []);
  };

  const getBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-section">

      {/* 🔥 TOP CONTRIBUTORS */}
      <h3 className="leaderboard-title">🏆 Top Contributors</h3>

      <div className="leaderboard-grid">
        {contributors.map((u, i) => (
          <LeaderCard
            key={u.user_id || i}
            badge={getBadge(i + 1)}
            name={u.full_name}
            department={u.department}
            count={u.count}
            label="Shoutouts"
          />
        ))}
      </div>

      {/* 🏷️ MOST TAGGED */}
      <h3 className="leaderboard-title" style={{ marginTop: 32 }}>
        🏷️ Most Tagged
      </h3>

      <div className="leaderboard-grid">
        {tagged.map((u, i) => (
          <LeaderCard
            key={u.user_id || i}
            badge={getBadge(i + 1)}
            name={u.full_name}
            department={u.department}
            count={u.count}
            label="Tags"
          />
        ))}
      </div>

    </div>
  );
}

/* ================= CARD ================= */

function LeaderCard({ badge, name, department, count, label }) {
  return (
    <div className="leader-card">
      {/* Rank Badge */}
      <div className="rank-badge">{badge}</div>

      {/* Avatar */}
      <div className="leader-avatar">
        {name
          .split(" ")
          .map((x) => x[0])
          .join("")}
      </div>

      {/* Name */}
      <h4 className="leader-name">{name}</h4>

      {/* Department */}
      <span className="dept-pill">{department}</span>

      {/* Count */}
      <div className="shoutout-count">
        <b>{count}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}
