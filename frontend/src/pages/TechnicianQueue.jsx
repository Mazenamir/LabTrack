import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const TechnicianQueue = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const statusConfig = {
    requested:        { label: "Requested",       bg: "#2d2a1a", color: "#fbbf24" },
    sample_collected: { label: "Sample Collected", bg: "#1a2535", color: "#4e8ef7" },
    processing:       { label: "Processing",       bg: "#231a35", color: "#a78bfa" },
    results_ready:    { label: "Results Ready",    bg: "#2d1f1a", color: "#fb923c" },
  };

  // Next status a technician can move to
  const nextStatus = {
    requested:        "sample_collected",
    sample_collected: "processing",
    processing:       "results_ready",
  };

  const nextLabel = {
    requested:        "Mark Sample Collected",
    sample_collected: "Mark Processing",
    processing:       "Mark Results Ready",
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const handleStatusUpdate = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await api.patch(`/requests/${requestId}/status`, { status: newStatus });
      // Refresh list
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

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
            🔬 {user?.name}
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

      <div className="container-fluid px-4 py-4" style={{ maxWidth: "1100px" }}>

        {/* ─── Header ───────────────────────────────────────── */}
        <div className="mb-4">
          <h4 className="fw-bold mb-1" style={{ color: "#ffffff" }}>
            Technician Queue
          </h4>
          <p className="small mb-0" style={{ color: "#6c757d" }}>
            Manage and progress active lab requests
          </p>
        </div>

        {/* ─── Stats ────────────────────────────────────────── */}
        <div className="row g-3 mb-4">
          {[
            { label: "Requested",        key: "requested",        icon: "📋", color: "#fbbf24" },
            { label: "Sample Collected", key: "sample_collected", icon: "🧫", color: "#4e8ef7" },
            { label: "Processing",       key: "processing",       icon: "⚙️",  color: "#a78bfa" },
            { label: "Results Ready",    key: "results_ready",    icon: "📊", color: "#fb923c" },
          ].map((s) => (
            <div key={s.key} className="col-6 col-md-3">
              <div className="p-4 rounded-3" style={{ backgroundColor: "#1a1d27" }}>
                <div className="fs-4 mb-1">{s.icon}</div>
                <div className="fs-3 fw-bold" style={{ color: s.color }}>
                  {requests.filter((r) => r.status === s.key).length}
                </div>
                <div className="small" style={{ color: "#6c757d" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Loading / Error ──────────────────────────────── */}
        {loading && (
          <div className="text-center py-5" style={{ color: "#6c757d" }}>
            <div className="spinner-border mb-3" style={{ color: "#4e8ef7" }} />
            <p>Loading queue...</p>
          </div>
        )}

        {error && (
          <div
            className="alert border-0 rounded-3"
            style={{ backgroundColor: "#2d1b1b", color: "#ff6b6b" }}
          >
            ❌ {error}
          </div>
        )}

        {/* ─── Requests Table ───────────────────────────────── */}
        {!loading && !error && (
          <div className="rounded-3 overflow-hidden" style={{ backgroundColor: "#1a1d27" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid #2d3145" }}>
              <h6 className="fw-semibold mb-0" style={{ color: "#ffffff" }}>
                Active Requests
              </h6>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-5" style={{ color: "#6c757d" }}>
                <div className="fs-1 mb-2">✅</div>
                <p>No active requests in the queue.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table mb-0" style={{ color: "#ffffff" }}>
                  <thead style={{ backgroundColor: "#252836", color: "#6c757d", fontSize: "12px" }}>
                    <tr>
                      <th className="px-4 py-3 fw-medium text-uppercase">Patient</th>
                      <th className="px-4 py-3 fw-medium text-uppercase">Doctor</th>
                      <th className="px-4 py-3 fw-medium text-uppercase">Urgency</th>
                      <th className="px-4 py-3 fw-medium text-uppercase">Status</th>
                      <th className="px-4 py-3 fw-medium text-uppercase">Date</th>
                      <th className="px-4 py-3 fw-medium text-uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req._id} style={{ borderColor: "#2d3145" }}>

                        {/* Patient */}
                        <td className="px-4 py-3">
                          <div className="fw-medium" style={{ color: "#ffffff" }}>
                            {req.patientId?.name}
                          </div>
                          <div className="small" style={{ color: "#6c757d" }}>
                            {req.patientId?.email}
                          </div>
                        </td>

                        {/* Doctor */}
                        <td className="px-4 py-3">
                          <div className="small" style={{ color: "#adb5bd" }}>
                            {req.doctorId?.name}
                          </div>
                        </td>

                        {/* Urgency */}
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

                        {/* Status */}
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

                        {/* Date */}
                        <td className="px-4 py-3 small" style={{ color: "#6c757d" }}>
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="d-flex gap-2">
                            {/* View Detail */}
                            <button
                              onClick={() => navigate(`/requests/${req._id}`)}
                              className="btn btn-sm border-0"
                              style={{
                                backgroundColor: "#1a2535",
                                color: "#4e8ef7",
                                borderRadius: "8px",
                              }}
                            >
                              View
                            </button>

                            {/* Progress Status */}
                            {nextStatus[req.status] && (
                              <button
                                onClick={() => handleStatusUpdate(req._id, nextStatus[req.status])}
                                disabled={updatingId === req._id}
                                className="btn btn-sm border-0 fw-medium"
                                style={{
                                  backgroundColor: "#1a2d1a",
                                  color: "#4ade80",
                                  borderRadius: "8px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {updatingId === req._id ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : nextLabel[req.status]}
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianQueue;