import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const RoleGuard = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-shell">
          <div className="dashboard-panel">
            <p className="dashboard-state">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return children;
};

export default RoleGuard;
