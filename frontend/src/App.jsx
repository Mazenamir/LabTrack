import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import CreateRequest from "./pages/CreateRequest";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import RequestDetail from "./pages/RequestDetail";
import TechnicianQueue from "./pages/TechnicianQueue";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient"
          element={
            <ProtectedRoute>
              <RoleGuard roles={["patient"]}>
                <PatientDashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard roles={["admin"]}>
                <AdminDashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <ProtectedRoute>
              <RoleGuard roles={["doctor"]}>
                <DoctorDashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/create-request"
          element={
            <ProtectedRoute>
              <RoleGuard roles={["doctor"]}>
                <CreateRequest />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/requests/:id"
          element={
            <ProtectedRoute>
              <RoleGuard roles={["doctor"]}>
                <RequestDetail />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <RequestDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician"
          element={
            <ProtectedRoute>
              <RoleGuard roles={["technician"]}>
                <TechnicianQueue />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </div>
  );
}

export default App;
