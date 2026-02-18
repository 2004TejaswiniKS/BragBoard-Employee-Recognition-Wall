import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FeedFilterContext } from "../context/FeedFilterContext";

export default function Sidebar({ departments = [] }) {
  const { user, logout } = useContext(AuthContext);
  const { setFilter } = useContext(FeedFilterContext);
  const navigate = useNavigate();

  return (
    <aside className="bb-sidebar">
      <h3 className="bb-logo">BragBoard</h3>

      <nav className="bb-nav">
        {/* MY PROFILE */}
        <button
          className="bb-link"
          onClick={() =>
            setFilter({
              type: "profile",
              label: "My Profile"
            })
          }
        >
          👤 My Profile
        </button>

        {/* MY DEPARTMENT */}
       {/* MY DEPARTMENT (EMPLOYEE ONLY) */}
{user.role === "employee" && (
  <button
    className="bb-link"
    onClick={() =>
      setFilter({
        type: "department",
        department: user.department,
        label: user.department
      })
    }
  >
    🏢 My Department
  </button>
)}

        {/* ALL DEPARTMENTS */}
        <button
          className="bb-link"
          onClick={() =>
            setFilter({
              type: "all",
              department: null,
              label: "All Departments"
            })
          }
        >
          🌐 All Departments
        </button>

        {/* ADMIN PANEL */}
        {user.role === "admin" && (
          <button
            className="bb-link admin"
            onClick={() => navigate("/admin")}
          >
            🛠 Admin Panel
          </button>
        )}

        {/* LOGOUT */}
        <button
          className="bb-link logout"
          onClick={logout}
        >
          🚪 Logout
        </button>
      </nav>
    </aside>
  );
}
