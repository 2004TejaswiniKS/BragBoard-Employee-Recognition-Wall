import { useEffect, useState } from "react";
import api from "../services/api";

export default function ShoutoutCreate({ onCreated }) {
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [department, setDepartment] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/api/users").then((res) => {
      setUsers(res.data.users || []);
    });
  }, []);

  const departments = [
    ...new Set(
      users
        .filter((u) => u.role === "employee" && u.department)
        .map((u) => u.department)
    )
  ];

  const peers = users.filter(
    (u) => u.role === "employee" && u.department === department
  );

  const toggleRecipient = (id) => {
    setRecipients((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const submit = async () => {
    if (!message || !department || recipients.length === 0) {
      setError("Please fill all fields and tag peers");
      return;
    }

    try {
      setSending(true);
      setError("");

      await api.post("/api/shoutouts", {
        message,
        department,
        recipient_ids: recipients
      });

      setMessage("");
      setDepartment("");
      setRecipients([]);

      // 🔥 Notify Dashboard → Feed refresh
      onCreated && onCreated();
    } catch {
      setError("Failed to send shoutout");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="create-card">
      <h3 className="card-title">Create Shoutout ➕</h3>

      <label className="form-label">Message</label>
      <textarea
        className="form-textarea"
        placeholder="Write something nice..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <label className="form-label">Department</label>
      <select
        className="form-select"
        value={department}
        onChange={(e) => {
          setDepartment(e.target.value);
          setRecipients([]);
        }}
      >
        <option value="">Select department</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <label className="form-label">Tag Peers</label>
      <div className="peer-list">
        {peers.map((u) => (
          <button
            key={u.id}
            type="button"
            className={`peer-pill ${
              recipients.includes(u.id) ? "active" : ""
            }`}
            onClick={() => toggleRecipient(u.id)}
          >
            {u.full_name}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <button
        className="btn-primary full-width"
        onClick={submit}
        disabled={sending}
      >
        {sending ? "Sending..." : "Send Shoutout"}
      </button>
    </div>
  );
}
