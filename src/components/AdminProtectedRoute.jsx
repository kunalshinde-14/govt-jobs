import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {

  const token = localStorage.getItem("adminToken");

  // NO TOKEN = redirect
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  // DECODE WITHOUT LIBRARY (just base64 decode the payload)
  try {

    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    // CHECK admin: true
    if (!payload.admin) {
      return <Navigate to="/admin-login" replace />;
    }

    // CHECK NOT EXPIRED
    if (payload.exp < Date.now() / 1000) {
      localStorage.removeItem("adminToken");
      return <Navigate to="/admin-login" replace />;
    }

    return children;

  } catch (error) {

    localStorage.removeItem("adminToken");
    return <Navigate to="/admin-login" replace />;

  }

}