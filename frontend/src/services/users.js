// src/services/users.js
import api from "./api";

// GET list of users
export const listUsers = () => api.get("/api/users/");

// optional: get by department
export const listUsersByDept = (dept) => api.get(`/api/users/?department=${encodeURIComponent(dept)}`);
