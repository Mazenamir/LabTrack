import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children }) => {
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

  return children;
};

export default ProtectedRoute;
