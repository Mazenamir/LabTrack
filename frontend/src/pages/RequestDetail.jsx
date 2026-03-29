import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);


  const statusConfig = {
    requested:        { label: "Requested",        bg: "#2d2a1a", color: "#fbbf24" },
    sample_collected: { label: "Sample Collected",  bg: "#1a2535", color: "#4e8ef7" },
    processing:       { label: "Processing",        bg: "#231a35", color: "#a78bfa" },
    results_ready:    { label: "Results Ready",     bg: "#2d1f1a", color: "#fb923c" },
    reviewed:         { label: "Reviewed",          bg: "#1a2d2a", color: "#34d399" },
    released:         { label: "Released",          bg: "#1a2d1a", color: "#4ade80" },
  };

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await api.get(`/requests/${id}`);
        setRequest(res.data.request);
        setItems(res.data.items)
      } catch (err) {
        setError("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const getDashboardPath = () => {
    if (user?.role === "doctor") return "/doctor";
    if (user?.role === "technician") return "/technician";
    if (user?.role === "admin") return "/admin";
    return "/";
  };

  // Styles
  const cardStyle = {
    backgroundColor: "#1a1d27",
    borderRadius: "16px",
    border: "1px solid #2d3145",
  };

  const labelStyle = { color: "#6c757d", fontSize: "13px" };
  const valueStyle = { color: "#ffffff", fontWeight: 500 };

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
        <button
          onClick={() => navigate(getDashboardPath())}
          className="btn btn-sm border-0"
          style={{ color: "#adb5bd", backgroundColor: "#252836" }}
        >
          ← Back
        </button>
      </nav>

      <div className="container py-4" style={{ maxWidth: "720px" }}>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5" style={{ color: "#6c757d" }}>
            <div className="spinner-border mb-3" style={{ color: "#4e8ef7" }} />
            <p>Loading request...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="alert border-0 rounded-3"
            style={{ backgroundColor: "#2d1b1b", color: "#ff6b6b" }}
          >
            ❌ {error}
          </div>
        )}

        {request && (
          <>
            {/* ─── Header ───────────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h4 className="fw-bold mb-1" style={{ color: "#ffffff" }}>
                  Request Detail
                </h4>
                <p className="small mb-0" style={{ color: "#6c757d" }}>
                  ID: {request._id}
                </p>
              </div>
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  backgroundColor: statusConfig[request.status]?.bg,
                  color: statusConfig[request.status]?.color,
                  fontSize: "13px",
                }}
              >
                {statusConfig[request.status]?.label}
              </span>
            </div>

            {/* ─── Patient & Doctor Info ─────────────────────── */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="p-4 h-100" style={cardStyle}>
                  <p className="mb-1" style={labelStyle}>👤 Patient</p>
                  <p className="mb-0 fw-semibold" style={valueStyle}>
                    {request.patientId?.name}
                  </p>
                  <p className="small mb-0" style={{ color: "#6c757d" }}>
                    {request.patientId?.email}
                  </p>
                  {request.patientId?.patientCode && (
                    <span
                      className="badge mt-2"
                      style={{ backgroundColor: "#1a2535", color: "#4e8ef7" }}
                    >
                      {request.patientId.patientCode}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-4 h-100" style={cardStyle}>
                  <p className="mb-1" style={labelStyle}>👨‍⚕️ Doctor</p>
                  <p className="mb-0 fw-semibold" style={valueStyle}>
                    {request.doctorId?.name}
                  </p>
                  <p className="small mb-0" style={{ color: "#6c757d" }}>
                    {request.doctorId?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Request Info ──────────────────────────────── */}
            <div className="p-4 mb-3" style={cardStyle}>
              <div className="row g-3">
                <div className="col-6">
                  <p className="mb-1" style={labelStyle}>Urgency</p>
                  <span
                    className="badge rounded-pill px-3 py-2"
                    style={{
                      backgroundColor: request.urgency === "urgent" ? "#2d1b1b" : "#1e2235",
                      color: request.urgency === "urgent" ? "#ff6b6b" : "#adb5bd",
                    }}
                  >
                    {request.urgency === "urgent" ? "🚨 Urgent" : "🟢 Normal"}
                  </span>
                </div>
                <div className="col-6">
                  <p className="mb-1" style={labelStyle}>Date Created</p>
                  <p className="mb-0" style={valueStyle}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {request.clinicalNotes && (
                  <div className="col-12">
                    <p className="mb-1" style={labelStyle}>Clinical Notes</p>
                    <p
                      className="mb-0 small p-3 rounded-3"
                      style={{ backgroundColor: "#252836", color: "#adb5bd" }}
                    >
                      {request.clinicalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Test Items ────────────────────────────────── */}
<div className="p-4 mb-3" style={cardStyle}>
  <p className="fw-semibold mb-3" style={{ color: "#ffffff" }}>
    🧪 Requested Tests
  </p>
  {items.length === 0 ? (
    <p className="small mb-0" style={{ color: "#6c757d" }}>No tests found.</p>
  ) : (
    <div className="d-flex flex-column gap-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="p-3 rounded-3 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#252836" }}
        >
          <div>
            <p className="mb-0 fw-semibold" style={{ color: "#ffffff" }}>
              {item.testTypeId?.name}
            </p>
            <p className="small mb-0" style={{ color: "#6c757d" }}>
              {item.testTypeId?.category} · Normal range: {item.testTypeId?.normalRange ?? "N/A"} {item.testTypeId?.unit}
            </p>
          </div>
          <div className="text-end">
            {item.resultValue !== null ? (
              <span className="badge px-3 py-2" style={{ backgroundColor: "#1a2d1a", color: "#4ade80" }}>
                Result: {item.resultValue} {item.testTypeId?.unit}
              </span>
            ) : (
              <span className="badge px-3 py-2" style={{ backgroundColor: "#2d2a1a", color: "#fbbf24" }}>
                Pending
              </span>
            )}
            {item.notes && (
              <p className="small mt-1 mb-0" style={{ color: "#6c757d" }}>
                📝 {item.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

            {/* ─── Results (if available) ────────────────────── */}
            {request.results && (
              <div className="p-4 mb-3" style={cardStyle}>
                <p className="fw-semibold mb-3" style={{ color: "#ffffff" }}>
                  📊 Results
                </p>
                <p className="small mb-0" style={{ color: "#adb5bd" }}>
                  {request.results}
                </p>
              </div>
            )}

            {/* ─── Interpretation (if available) ────────────── */}
            {request.interpretation && (
              <div className="p-4" style={cardStyle}>
                <p className="fw-semibold mb-3" style={{ color: "#ffffff" }}>
                  📝 Doctor's Interpretation
                </p>
                <p className="small mb-0" style={{ color: "#adb5bd" }}>
                  {request.interpretation}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;