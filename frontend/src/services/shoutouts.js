import api from "./api";

// Create shoutout
export const createShoutout = (payload) =>
  api.post("/api/shoutouts", payload);

// Get feed
export const getShoutouts = () =>
  api.get("/api/shoutouts");
