import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/authProvider";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} />;
  }
  return children;
};

export default ProtectedRoute;
