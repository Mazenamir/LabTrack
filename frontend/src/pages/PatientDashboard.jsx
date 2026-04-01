import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const statusLabels = {
  requested: "Requested",
  sample_collected: "Sample collected",
  processing: "Processing",
  results_ready: "Results ready",
  reviewed: "Reviewed",
  released: "Released",
};

const statusTones = {
  requested: "warning",
  sample_collected: "info",
  processing: "accent",
  results_ready: "ready",
  reviewed: "success",
  released: "success",
};

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/requests");
        setRequests(res.data.requests || []);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.msg || "Failed to load your requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const stats = useMemo(
    () => [
      { label: "My requests", value: requests.length },
      { label: "In progress", value: requests.filter((item) => ["requested", "sample_collected", "processing"].includes(item.status)).length },
      { label: "Ready to review", value: requests.filter((item) => item.status === "results_ready").length },
      { label: "Released", value: requests.filter((item) => item.status === "released").length },
    ],
    [requests]
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-role">Patient</p>
            <h1 className="dashboard-title">Patient dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome, {user?.name || "Patient"}. Follow the current status of your lab requests in one place.
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
              <h2>Your request history</h2>
              <p>Open any request to see tests, notes, and result progress.</p>
            </div>
          </div>

          {loading && <p className="dashboard-state">Loading your requests...</p>}
          {!loading && error && <p className="dashboard-state dashboard-state-error">{error}</p>}
          {!loading && !error && requests.length === 0 && <p className="dashboard-state">You do not have any requests yet.</p>}

          {!loading && !error && requests.length > 0 && (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Created</th>
                    <th>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        <strong>{request.doctorId?.name || "Unknown doctor"}</strong>
                      </td>
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
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link className="dashboard-link dashboard-link-button" to={`/requests/${request._id}`}>
                          View details
                        </Link>
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

export default PatientDashboard;
