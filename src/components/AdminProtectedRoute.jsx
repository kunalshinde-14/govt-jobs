import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const [isValidAdmin] = useState(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload?.admin && payload?.exp && payload.exp >= nowInSeconds) {
        return true;
      }
      localStorage.removeItem("adminToken");
      return false;
    } catch {
      localStorage.removeItem("adminToken");
      return false;
    }
  });

  if (!isValidAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}