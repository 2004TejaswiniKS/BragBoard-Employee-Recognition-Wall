import api from "./api";

// analytics
export const getTopContributors = () =>
  api.get("/api/admin/top-contributors");

export const getMostTagged = () =>
  api.get("/api/admin/most-tagged");

// reports
export const getReportedShoutouts = () =>
  api.get("/api/admin/reports");

export const resolveReport = (reportId) =>
  api.delete(`/api/admin/reports/${reportId}`);

export const deleteReportedShoutout = (shoutoutId) =>
  api.delete(`/api/admin/shoutouts/${shoutoutId}`);

export const getAnalyticsSummary = () =>
  api.get("/api/admin/analytics-summary");

export const getUserShoutouts = (userId) =>
  api.get(`/api/admin/users/${userId}/shoutouts`);
export const downloadCSV = () =>
  api.get("/api/admin/export/shoutouts/csv", {
    responseType: "blob"
  });

export const downloadPDF = () =>
  api.get("/api/admin/export/shoutouts/pdf", {
    responseType: "blob"
  });
  export const getLeaderboard = () =>
  api.get("/api/admin/leaderboard");

  export const getAllUsers = () =>
  api.get("/api/admin/users");

export const deleteUser = (userId) =>
  api.delete(`/api/admin/users/${userId}`);

export const createUser = (data) =>
  api.post("/api/admin/users", data);