import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        
        <Route path="/register" element={<Register />} />

        <Route path="/doctor" element={<div className="p-10 text-center"><h1>Welcome Doctor Dashboard</h1></div>} />
        <Route path="/technician" element={<div className="p-10 text-center"><h1>Welcome Tech Dashboard</h1></div>} />
        <Route path="/patient" element={<div className="p-10 text-center"><h1>Welcome Patient Dashboard</h1></div>} />
      </Routes>
    </div>
  );
}

export default App;