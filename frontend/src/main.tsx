import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export type Page =
  | "dashboard"
  | "projects"
  | "labour"
  | "attendance"
  | "payroll"
  | "materials"
  | "expenses"
  | "reports"
  | "users";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentPage("dashboard");
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Dashboard
      token={token}
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    />
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);