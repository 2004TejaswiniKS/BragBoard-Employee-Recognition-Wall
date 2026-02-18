import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import ShoutoutCard from "../components/ShoutoutCard";
import { FeedFilterContext } from "../context/FeedFilterContext";
import { AuthContext } from "../context/AuthContext";

export default function Feed({ refreshKey }) {
  const { filter, setFilter } = useContext(FeedFilterContext);
  const { user } = useContext(AuthContext);

  const [allShoutouts, setAllShoutouts] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    sent: 0,
    received: 0,
    reactions: 0
  });

  useEffect(() => {
    loadFeed();
  }, [refreshKey]); // 🔥 refresh on new shoutout

  useEffect(() => {
    applyFilters();
  }, [filter, search, allShoutouts]);

  const normalize = (v) =>
    v?.toString().toLowerCase().trim();

  /* ================= LOAD FEED ================= */

  const loadFeed = async () => {
    setLoading(true);

    const res = await api.get("/api/shoutouts");
    const data = res.data || [];

    const depts = [
      ...new Set(data.map((s) => s.department).filter(Boolean))
    ];

    let reactions = 0;

    if (user.role === "admin") {
      for (const s of data) {
        const r = await api.get(
          `/api/shoutouts/${s.id}/reactions`
        );
        reactions += (r.data || []).length;
      }

      setStats({
        sent: data.filter(
          (s) => s.sender_name === user.full_name
        ).length,
        received: data.length,
        reactions
      });
    } else {
      const sent = data.filter(
        (s) => s.sender_name === user.full_name
      );

      for (const s of sent) {
        const r = await api.get(
          `/api/shoutouts/${s.id}/reactions`
        );
        reactions += (r.data || []).length;
      }

      setStats({
        sent: sent.length,
        received: data.filter((s) =>
          s.recipients?.includes(user.full_name)
        ).length,
        reactions
      });
    }

    setDepartments(depts);
    setAllShoutouts(data);
    setShoutouts(data);
    setLoading(false);
  };

  /* ================= FILTERS ================= */

  const applyFilters = () => {
    let data = [...allShoutouts];

    if (filter.type === "sent") {
      data = data.filter(
        (s) => s.sender_name === user.full_name
      );
    }

    if (filter.type === "received") {
      data = data.filter(
        (s) => s.recipients?.includes(user.full_name)
      );
    }

    if (filter.department && filter.department !== "all") {
      data = data.filter(
        (s) => s.department === filter.department
      );
    }

    if (search.trim()) {
      const q = normalize(search);
      data = data.filter(
        (s) =>
          normalize(s.message).includes(q) ||
          normalize(s.sender_name).includes(q)
      );
    }

    setShoutouts(data);
  };

  return (
    <div className="feed-wrapper">
      {/* HEADER */}
      <div className="feed-header">
        <h3 className="card-title">Shoutouts Feed 📢</h3>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="search-input"
            placeholder="Search by name or message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="btn-outline"
            value={filter.department || "all"}
            onChange={(e) =>
              setFilter({
                ...filter,
                department: e.target.value
              })
            }
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card sent">
          <span className="stat-label">Sent</span>
          <span className="stat-value">{stats.sent}</span>
        </div>

        <div className="stat-card received">
          <span className="stat-label">
            {user.role === "admin"
              ? "Total Shoutouts"
              : "Received"}
          </span>
          <span className="stat-value">{stats.received}</span>
        </div>

        <div className="stat-card reactions">
          <span className="stat-label">Reactions</span>
          <span className="stat-value">{stats.reactions}</span>
        </div>
      </div>

      {/* FEED */}
      <div className="feed-scroll">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : shoutouts.length === 0 ? (
          <p className="muted">No shoutouts found</p>
        ) : (
          shoutouts.map((s) => (
            <ShoutoutCard
              key={s.id}
              shoutout={s}
              isAdmin={user.role === "admin"}
            />
          ))
        )}
      </div>
    </div>
  );
}
