import { useEffect, useState } from "react";
import {
  getReportedShoutouts,
  resolveReport,
  deleteReportedShoutout
} from "../services/admin";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    const res = await getReportedShoutouts();
    setReports(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) return <p>Loading reports...</p>;

  return (
    <section className="admin-section">
      <h2>🚩 Reports</h2>

      {reports.length === 0 ? (
        <p>No reports found</p>
      ) : (
        <div className="reports-grid">
          {reports.map((r) => (
            <div key={r.id} className="report-box">
              {/* HEADER */}
              <div className="report-header">
                <span className="badge">Report #{r.id}</span>
                <small>
                  {new Date(r.created_at).toLocaleString()}
                </small>
              </div>

              {/* REPORT INFO */}
              <p>
                <b>Reported By:</b>{" "}
                {r.reported_by}
                {r.reported_by_email && (
                  <span className="email">
                    {" "}({r.reported_by_email})
                  </span>
                )}
              </p>

              <p>
                <b>Reason:</b> {r.reason}
              </p>

              {/* REPORTED SHOUTOUT */}
              {r.shoutout ? (
                <div className="reported-shoutout">
                  <b>Reported Shoutout</b>

                  <p className="shoutout-text">
                    {r.shoutout.content}
                  </p>

                  <small>
                    by {r.shoutout.posted_by}
                    {r.shoutout.posted_by_email && (
                      <span className="email">
                        {" "}({r.shoutout.posted_by_email})
                      </span>
                    )}
                  </small>
                </div>
              ) : (
                <div className="reported-shoutout">
                  <b>Reported Shoutout</b>
                  <p className="shoutout-text muted">
                    Shoutout details not available
                  </p>
                </div>
              )}

              {/* ACTIONS */}
              <div className="report-actions">
                <button
                  className="btn-success"
                  onClick={() =>
                    resolveReport(r.id).then(loadReports)
                  }
                >
                  Resolve
                </button>

                <button
                  className="btn-danger"
                  onClick={() =>
                    deleteReportedShoutout(r.shoutout_id)
                      .then(loadReports)
                  }
                >
                  Delete Shoutout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
