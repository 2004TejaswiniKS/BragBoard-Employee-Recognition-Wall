import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function ShoutoutCard({ shoutout, isAdmin = false }) {
  const { user } = useContext(AuthContext);

  const [reactions, setReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadReactions();
    loadComments();
  }, []);

  const loadReactions = async () => {
    const res = await api.get(
      `/api/shoutouts/${shoutout.id}/reactions`
    );
    setReactions(res.data || []);
  };

  const loadComments = async () => {
    const res = await api.get(
      `/api/shoutouts/${shoutout.id}/comments`
    );
    setComments(res.data || []);
  };

  const formatDate = (dt) =>
    new Date(dt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });

  /* ================= REACTIONS ================= */

  const myReaction = reactions.find(
    (r) => r.user_id === user.id
  );

  const react = async (type) => {
    if (myReaction?.reaction === type) {
      await api.delete(
        `/api/shoutouts/${shoutout.id}/reactions`
      );
    } else {
      await api.post(
        `/api/shoutouts/${shoutout.id}/reactions`,
        { reaction: type }
      );
    }
    loadReactions();
  };

  const count = (type) =>
    reactions.filter((r) => r.reaction === type).length;

  /* ================= COMMENTS ================= */

  const postComment = async () => {
    if (!commentText.trim()) return;

    await api.post(
      `/api/shoutouts/${shoutout.id}/comments`,
      { comment: commentText }
    );

    setCommentText("");
    loadComments();
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    await api.delete(`/api/admin/comments/${commentId}`);

    // 🔥 Update UI immediately
    setComments((prev) =>
      prev.filter((c) => c.id !== commentId)
    );
  };

  /* ================= REPORT (EMPLOYEE) ================= */

  const submitReport = async () => {
    if (!reportReason.trim()) {
      alert("Please enter a reason");
      return;
    }

    await api.post(
      `/api/shoutouts/${shoutout.id}/report`,
      { reason: reportReason }
    );

    alert("Shoutout reported successfully");

    setReportReason("");
    setReporting(false);
  };

  /* ================= UI ================= */

  return (
    <div className="feed-card">

      <h4>{shoutout.message}</h4>

      <p>
        <b>From:</b> {shoutout.sender_name} ({shoutout.department})
      </p>

      {shoutout.recipients?.length > 0 && (
        <p>
          <b>To:</b> {shoutout.recipients.join(", ")}
        </p>
      )}

      <p className="muted">
        Posted on {formatDate(shoutout.created_at)}
      </p>

      {/* ================= REACTIONS ================= */}
      <div className="reaction-row">
        <span
          className={myReaction?.reaction === "like" ? "active" : ""}
          onClick={() => react("like")}
        >
          👍 {count("like")}
        </span>

        <span
          className={myReaction?.reaction === "clap" ? "active" : ""}
          onClick={() => react("clap")}
        >
          👏 {count("clap")}
        </span>

        <span
          className={myReaction?.reaction === "love" ? "active" : ""}
          onClick={() => react("love")}
        >
          ⭐ {count("love")}
        </span>
      </div>

      {/* ================= REPORT (EMPLOYEE ONLY) ================= */}
      {user.role === "employee" && (
        <div style={{ marginTop: 12 }}>
          {!reporting ? (
            <button
              className="danger-outline-btn"
              onClick={() => setReporting(true)}
            >
              🚩 Report Shoutout
            </button>
          ) : (
            <div className="report-box">
              <textarea
                placeholder="Reason for reporting..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  className="btn-danger"
                  onClick={submitReport}
                >
                  Submit
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setReporting(false);
                    setReportReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= COMMENTS ================= */}
      <div style={{ marginTop: 14 }}>
        <input
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />

        <button
          className="btn-secondary"
          onClick={postComment}
        >
          Post
        </button>

        {comments.map((c) => (
          <div key={c.id} style={{ marginTop: 10 }}>
            <div
              className="muted"
              style={{
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>
                💬 <b>{c.user_name}</b>
                <span style={{ fontSize: 12 }}>
                  {" "}· {c.department ?? "—"}
                </span>
              </span>

              {/* 🔐 ADMIN DELETE */}
              {isAdmin && (
                <button
                  className="icon-danger"
                  onClick={() => deleteComment(c.id)}
                  title="Delete comment"
                >
                  🗑
                </button>
              )}
            </div>

            <div>{c.comment}</div>
            <div className="muted">
              {formatDate(c.created_at)}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
