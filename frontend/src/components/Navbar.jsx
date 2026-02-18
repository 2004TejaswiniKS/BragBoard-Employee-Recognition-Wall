import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* ===== Brand ===== */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            BragBoard
          </Link>

          {user && (
            <span className="navbar-user">
              Hello, {user.full_name}
            </span>
          )}
        </div>

        {/* ===== Actions ===== */}
        {user && (
          <nav className="navbar-actions">
            <Link
              to="/dashboard/feed"
              className="nav-link"
            >
              📣 Feed
            </Link>

            <Link
              to="/dashboard/create"
              className="nav-link primary"
            >
              ➕ Create
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin"
                className="nav-link"
              >
                🛠 Admin
              </Link>
            )}

            <button
              className="nav-link danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
