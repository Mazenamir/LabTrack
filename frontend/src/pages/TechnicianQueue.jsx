import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const statusLabels = {
  requested: "Requested",
  sample_collected: "Sample collected",
  processing: "Processing",
  results_ready: "Results ready",
};

const statusTones = {
  requested: "warning",
  sample_collected: "info",
  processing: "accent",
  results_ready: "ready",
};

const nextStatusMap = {
  requested: "sample_collected",
  sample_collected: "processing",
  processing: "results_ready",
};

const nextStatusLabel = {
  requested: "Collect sample",
  sample_collected: "Start processing",
  processing: "Mark ready",
};

const TechnicianQueue = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests");
      setRequests(res.data.requests || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Failed to load technician queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const stats = useMemo(
    () => [
      { label: "In queue", value: requests.length },
      { label: "Requested", value: requests.filter((item) => item.status === "requested").length },
      { label: "Processing", value: requests.filter((item) => item.status === "processing").length },
      { label: "Ready", value: requests.filter((item) => item.status === "results_ready").length },
    ],
    [requests]
  );

  const handleStatusUpdate = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await api.patch(`/requests/${requestId}/status`, { status: newStatus });
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Failed to update request status.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-role">Technician</p>
            <h1 className="dashboard-title">Technician queue</h1>
            <p className="dashboard-subtitle">
              Welcome, {user?.name || "Technician"}. Move requests through the lab workflow step by step.
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              className="dashboard-button dashboard-button-ghost"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-stats">
          {stats.map((stat) => (
            <article key={stat.label} className="dashboard-stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Active requests</h2>
              <p>Open a request to review patient details or move it to the next lab stage.</p>
            </div>
          </div>

          {loading && <p className="dashboard-state">Loading queue...</p>}
          {!loading && error && <p className="dashboard-state dashboard-state-error">{error}</p>}
          {!loading && !error && requests.length === 0 && <p className="dashboard-state">No active requests right now.</p>}

          {!loading && !error && requests.length > 0 && (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        <strong>{request.patientId?.name || "Unknown patient"}</strong>
                        <span>{request.patientId?.email || "No email"}</span>
                      </td>
                      <td>{request.doctorId?.name || "Unknown doctor"}</td>
                      <td>
                        <span className={`dashboard-badge dashboard-badge-${statusTones[request.status] || "default"}`}>
                          {statusLabels[request.status] || request.status}
                        </span>
                      </td>
                      <td>
                        <span className={`dashboard-badge ${request.urgency === "urgent" ? "dashboard-badge-danger" : "dashboard-badge-neutral"}`}>
                          {request.urgency === "urgent" ? "Urgent" : "Normal"}
                        </span>
                      </td>
                      <td>
                        <div className="dashboard-inline-actions">
                          <Link className="dashboard-link dashboard-link-button" to={`/requests/${request._id}`}>
                            Open
                          </Link>
                          {nextStatusMap[request.status] && (
                            <button
                              className="dashboard-button dashboard-button-small"
                              disabled={updatingId === request._id}
                              onClick={() => handleStatusUpdate(request._id, nextStatusMap[request.status])}
                            >
                              {updatingId === request._id ? "Saving..." : nextStatusLabel[request.status]}
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
        </section>
      </div>
    </div>
  );
};

export default TechnicianQueue;
