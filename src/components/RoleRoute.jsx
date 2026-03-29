import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
