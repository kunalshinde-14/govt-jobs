import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminProtectedRoute({ children }) {

  try {

    const token =
      localStorage.getItem("adminToken");

    if (!token) {
      return <Navigate to="/admin-login" />;
    }

    // ✅ VERIFY TOKEN HAS admin: true
    const decoded = jwtDecode(token);

    if (!decoded.admin) {
      return <Navigate to="/admin-login" />;
    }

    // ✅ CHECK NOT EXPIRED
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      localStorage.removeItem("adminToken");
      return <Navigate to="/admin-login" />;
    }

    return children;

  } catch (error) {

    // INVALID TOKEN
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin-login" />;

  }

}