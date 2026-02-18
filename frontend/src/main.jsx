import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";   // 🔴 THIS MUST EXIST
import "./styles/ui.css";

createRoot(document.getElementById("root")).render(<App />);
