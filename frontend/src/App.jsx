import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { FeedFilterProvider } from "./context/FeedFilterContext";

import ProtectedRoute from "./components/ProtectedRoute";

/* PUBLIC */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* DASHBOARD */
import Dashboard from "./pages/Dashboard";

/* ADMIN */
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* DASHBOARD (ADMIN + EMPLOYEE LAND HERE) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <FeedFilterProvider>
                  <Dashboard />
                </FeedFilterProvider>
              </ProtectedRoute>
            }
          />

          {/* ADMIN PANEL (ONLY VIA SIDEBAR CLICK) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* default admin page */}
            <Route index element={<AdminDashboard />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
