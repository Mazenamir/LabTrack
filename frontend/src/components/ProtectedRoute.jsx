import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2">🧬</div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;