// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";

import App from "./App";
import "./index.css";

// The codebase uses both axios and fetch for API calls. Attach the current
// bearer token to requests aimed at our configured API so private endpoints
// remain authenticated regardless of which transport a screen uses.
const apiOrigins = new Set([
  new URL(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").origin,
  `http://${window.location.hostname}:5000`,
]);
localStorage.removeItem("token"); // discard legacy JS-readable sessions
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const requestUrl = new URL(config.url || "", config.baseURL || window.location.href);
  if (apiOrigins.has(requestUrl.origin)) config.withCredentials = true;
  return config;
});

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const rawUrl = typeof input === "string" || input instanceof URL ? input : input.url;
  const requestUrl = new URL(rawUrl, window.location.href);
  if (!apiOrigins.has(requestUrl.origin)) return nativeFetch(input, init);
  return nativeFetch(input, { ...init, credentials: "include" });
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
