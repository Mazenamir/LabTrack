import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statusConfig = {
    requested:        { label: "Requested",        bg: "#2d2a1a", color: "#fbbf24" },
    sample_collected: { label: "Sample Collected",  bg: "#1a2535", color: "#4e8ef7" },
    processing:       { label: "Processing",        bg: "#231a35", color: "#a78bfa" },
    results_ready:    { label: "Results Ready",     bg: "#2d1f1a", color: "#fb923c" },
    reviewed:         { label: "Reviewed",          bg: "#1a2d2a", color: "#34d399" },
    released:         { label: "Released",          bg: "#1a2d1a", color: "#4ade80" },
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/requests");
        setRequests(res.data.requests);
      } catch {
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const stats = [
    { label: "Total Requests", value: requests.length,                                          icon: "📋", color: "#4e8ef7" },
    { label: "Pending",        value: requests.filter(r => r.status === "requested").length,     icon: "⏳", color: "#fbbf24" },
    { label: "Results Ready",  value: requests.filter(r => r.status === "results_ready").length, icon: "📊", color: "#fb923c" },
    { label: "Released",       value: requests.filter(r => r.status === "released").length,      icon: "✅", color: "#4ade80" },
  ];

  return (
    <div style={{ backgroundColor: "#0f1117", minHeight: "100vh" }}>

      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav
        className="px-4 py-3 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "#1a1d27", borderBottom: "1px solid #2d3145" }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="fs-4">🧬</span>
          <span className="fw-bold fs-5" style={{ color: "#4e8ef7" }}>LabTrack</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="small" style={{ color: "#adb5bd" }}>
            👨‍⚕️ Dr. {user?.name}
          </span>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="btn btn-sm border-0"
            style={{ color: "#ff6b6b", backgroundColor: "#2d1b1b" }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid px-4 py-4" style={{ maxWidth: "1200px" }}>

        {/* ─── Header ───────────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#ffffff" }}>
              Doctor Dashboard
            </h4>
            <p className="small mb-0" style={{ color: "#6c757d" }}>
              Manage your test requests and patient results
            </p>
          </div>
          <button
            onClick={() => navigate("/doctor/create-request")}
            className="btn fw-semibold"
            style={{
              backgroundColor: "#4e8ef7",
              color: "#ffffff",
              borderRadius: "10px",
              border: "none",
              padding: "10px 20px",
            }}
          >
            + New Request
          </button>
        </div>

        {/* ─── Stats Cards ──────────────────────────────────── */}
        <div className="row g-3 mb-4">
          {stats.map((stat) => (
            <div key={stat.label} className="col-6 col-md-3">
              <div
                className="p-4 rounded-3"
                style={{ backgroundColor: "#1a1d27" }}
              >
                <div className="fs-4 mb-1">{stat.icon}</div>
                <div className="fs-3 fw-bold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="small" style={{ color: "#6c757d" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Requests Table ───────────────────────────────── */}
        <div
          className="rounded-3 overflow-hidden"
          style={{ backgroundColor: "#1a1d27" }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid #2d3145" }}
          >
            <h6 className="fw-semibold mb-0" style={{ color: "#ffffff" }}>
              All Test Requests
            </h6>
          </div>

          {loading ? (
            <div className="text-center py-5" style={{ color: "#6c757d" }}>
              <div className="fs-1 mb-2">⏳</div>
              <p>Loading requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5" style={{ color: "#ff6b6b" }}>
              <div className="fs-1 mb-2">❌</div>
              <p>{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5" style={{ color: "#6c757d" }}>
              <div className="fs-1 mb-2">📋</div>
              <p>No requests yet. Create your first one!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ color: "#ffffff" }}>
                <thead style={{ backgroundColor: "#252836", color: "#6c757d", fontSize: "12px" }}>
                  <tr>
                    <th className="px-4 py-3 fw-medium text-uppercase">Patient</th>
                    <th className="px-4 py-3 fw-medium text-uppercase">Urgency</th>
                    <th className="px-4 py-3 fw-medium text-uppercase">Status</th>
                    <th className="px-4 py-3 fw-medium text-uppercase">Date</th>
                    <th className="px-4 py-3 fw-medium text-uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req._id}
                      style={{ borderColor: "#2d3145" }}
                    >
                      <td className="px-4 py-3">
                        <div className="fw-medium" style={{ color: "#ffffff" }}>
                          {req.patientId?.name}
                        </div>
                        <div className="small" style={{ color: "#6c757d" }}>
                          {req.patientId?.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            backgroundColor: req.urgency === "urgent" ? "#2d1b1b" : "#1e2235",
                            color: req.urgency === "urgent" ? "#ff6b6b" : "#adb5bd",
                            fontSize: "12px",
                          }}
                        >
                          {req.urgency === "urgent" ? "🚨 Urgent" : "🟢 Normal"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            backgroundColor: statusConfig[req.status]?.bg,
                            color: statusConfig[req.status]?.color,
                            fontSize: "12px",
                          }}
                        >
                          {statusConfig[req.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 small" style={{ color: "#6c757d" }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/doctor/requests/${req._id}`)}
                          className="btn btn-sm border-0 fw-medium"
                          style={{
                            backgroundColor: "#1a2535",
                            color: "#4e8ef7",
                            borderRadius: "8px",
                          }}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;