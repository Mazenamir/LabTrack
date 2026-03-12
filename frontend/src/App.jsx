import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientPortal from "./pages/PatientPortal";
import TechnicianQueue from "./pages/TechnicianQueue";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute>
              <RoleGuard roles={["doctor"]}>
                <DoctorDashboard />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/patient" element={
            <ProtectedRoute>
              <RoleGuard roles={["patient"]}>
                <PatientPortal />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/technician" element={
            <ProtectedRoute>
              <RoleGuard roles={["technician"]}>
                <TechnicianQueue />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <RoleGuard roles={["admin"]}>
                <AdminDashboard />
              </RoleGuard>
            </ProtectedRoute>
          } />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={
            <div className="text-center mt-10 text-red-500 text-xl">
              ⛔ Unauthorized Access
            </div>
          } />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;