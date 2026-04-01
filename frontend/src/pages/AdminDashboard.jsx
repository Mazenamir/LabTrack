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

const AdminDashboard = () => {
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
        setError(err.response?.data?.message || err.response?.data?.msg || "Failed to load admin overview.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const stats = useMemo(
    () => [
      { label: "All requests", value: requests.length },
      { label: "Urgent", value: requests.filter((item) => item.urgency === "urgent").length },
      { label: "Ready", value: requests.filter((item) => item.status === "results_ready").length },
      { label: "Released", value: requests.filter((item) => item.status === "released").length },
    ],
    [requests]
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-role">Admin</p>
            <h1 className="dashboard-title">Admin dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome, {user?.name || "Admin"}. Use this page as a simple overview of all lab requests.
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
              <h2>Global request overview</h2>
              <p>Monitor patient, doctor, and technician activity from one table.</p>
            </div>
          </div>

          {loading && <p className="dashboard-state">Loading overview...</p>}
          {!loading && error && <p className="dashboard-state dashboard-state-error">{error}</p>}
          {!loading && !error && requests.length === 0 && <p className="dashboard-state">No requests found in the system.</p>}

          {!loading && !error && requests.length > 0 && (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Technician</th>
                    <th>Status</th>
                    <th>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        <strong>{request.patientId?.name || "Unknown patient"}</strong>
                      </td>
                      <td>{request.doctorId?.name || "Unknown doctor"}</td>
                      <td>{request.technicianId?.name || "Not assigned"}</td>
                      <td>
                        <span className={`dashboard-badge dashboard-badge-${statusTones[request.status] || "default"}`}>
                          {statusLabels[request.status] || request.status}
                        </span>
                      </td>
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

export default AdminDashboard;
