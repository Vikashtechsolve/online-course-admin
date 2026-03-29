import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
