import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="page-center">
      <div className="form-box">
        <h1>BragBoard</h1>
        <p>Quick sign in</p>

        <button className="btn-primary" onClick={() => nav("/login")}>
          Login
        </button>

        <button className="btn-secondary" onClick={() => nav("/register")}>
          Create Account
        </button>
      </div>
    </div>
  );
}
