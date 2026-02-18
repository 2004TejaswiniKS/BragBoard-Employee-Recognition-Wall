import api from "./api";

export const login = (username, password) => {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  return api.post("/api/auth/login", body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

/* ✅ REGISTER — NO ROLE */
export const register = (payload) => {
  return api.post("/api/auth/register", {
    full_name: payload.full_name,
    email: payload.email,
    password: payload.password,
    department: payload.department,
  });
};

export const me = () => api.get("/api/auth/me");
