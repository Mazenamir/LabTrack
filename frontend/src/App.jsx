import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import CreateRequest from "./pages/CreateRequest";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard"; 
import RequestDetail from "./pages/RequestDetail";
import TechnicianQueue from "./pages/TechnicianQueue"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* <Route path="/technician" element={<div className="p-5 text-center text-dark"><h1>Welcome Tech Dashboard</h1></div>} /> */}
        <Route path="/patient" element={<div className="p-5 text-center text-dark"><h1>Welcome Patient Dashboard</h1></div>} />

        {/* Doctor Pages */}
        <Route path="/doctor" element={
          <ProtectedRoute>
            <RoleGuard roles={["doctor"]}>
              <DoctorDashboard />
            </RoleGuard>
          </ProtectedRoute>
        } />

        <Route path="/doctor/create-request" element={
          <ProtectedRoute>
            <RoleGuard roles={["doctor"]}>
              <CreateRequest />
            </RoleGuard>
          </ProtectedRoute>
        } />

        <Route path="/doctor/requests/:id" element={
          <ProtectedRoute>
            <RoleGuard roles={["doctor"]}>
              <RequestDetail />
            </RoleGuard>
          </ProtectedRoute>
        } />


        <Route path="/requests/:id" element={
          <ProtectedRoute><RequestDetail /></ProtectedRoute>
        } />

<Route path="/technician" element={
  <ProtectedRoute><RoleGuard roles={["technician"]}><TechnicianQueue /></RoleGuard></ProtectedRoute>
} />
        
      </Routes>


      
    </div>
  );
}

export default App;