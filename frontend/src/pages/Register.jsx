import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { register, login } = useContext(AuthContext);
  const nav = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "",
    role: "employee",
  });

 const submit = async (e) => {
  e.preventDefault();

  try {
    await register(form);
    nav("/login"); // silent redirect
  } catch (err) {
    console.error("Registration error:", err.response?.data || err);
  }
};

  return (
    <div className="page-center">
      <div className="form-box">
        <h2>Create Account</h2>

        <form onSubmit={submit}>
          <input
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
            required
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) =>
              setForm({ ...form, department: e.target.value })
            }
          />

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="employee">employee</option>
            <option value="admin">admin</option>
          </select>

          <button className="btn-primary">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
