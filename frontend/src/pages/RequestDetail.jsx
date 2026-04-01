import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await api.get(`/requests/${id}`);
        setRequest(res.data.request);
        setItems(res.data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.msg || "Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const backPath = user?.role === "doctor" ? "/doctor" : user?.role === "technician" ? "/technician" : user?.role === "admin" ? "/admin" : "/patient";

  return (
    <div className="form-page">
      <div className="form-shell">
        <section className="form-panel">
          <div className="form-header">
            <div>
              <button type="button" className="dashboard-button dashboard-button-ghost" onClick={() => navigate(backPath)}>
                Back
              </button>
              <p className="form-eyebrow">Request Detail</p>
              <h2 className="form-title">Request information</h2>
              <p className="form-subtitle">Review the patient, doctor, request status, and requested tests.</p>
            </div>
          </div>

          {loading && <p className="dashboard-state">Loading request...</p>}
          {!loading && error && <p className="dashboard-state dashboard-state-error">{error}</p>}

          {!loading && !error && request && (
            <div className="form-grid">
              <div className="form-row">
                <div className="form-panel">
                  <p className="form-eyebrow">Patient</p>
                  <h2>{request.patientId?.name || "Unknown patient"}</h2>
                  <p>{request.patientId?.email || "No email"}</p>
                  {request.patientId?.phone && <p>{request.patientId.phone}</p>}
                </div>

                <div className="form-panel">
                  <p className="form-eyebrow">Doctor</p>
                  <h2>{request.doctorId?.name || "Unknown doctor"}</h2>
                  <p>{request.doctorId?.email || "No email"}</p>
                  {request.doctorId?.specialization && <p>{request.doctorId.specialization}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-panel">
                  <p className="form-eyebrow">Status</p>
                  <div className={`form-badge form-badge-${statusTones[request.status] || "default"}`}>
                    {statusLabels[request.status] || request.status}
                  </div>
                  <p className="form-note">Created on {new Date(request.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="form-panel">
                  <p className="form-eyebrow">Urgency</p>
                  <div className={`form-badge ${request.urgency === "urgent" ? "form-badge-danger" : "form-badge-neutral"}`}>
                    {request.urgency === "urgent" ? "Urgent" : "Normal"}
                  </div>
                  {request.notes && <p className="form-note">{request.notes}</p>}
                </div>
              </div>

              <div className="form-panel">
                <p className="form-eyebrow">Requested tests</p>
                {items.length === 0 ? (
                  <p className="form-note">No tests found for this request.</p>
                ) : (
                  <div className="form-list">
                    {items.map((item) => (
                      <div key={item._id} className="form-list-item">
                        <div>
                          <strong>{item.testTypeId?.name || "Unnamed test"}</strong>
                          <p className="form-note">
                            {item.testTypeId?.category || "General"}
                            {item.testTypeId?.normalRange ? ` - Normal range: ${item.testTypeId.normalRange}` : ""}
                            {item.testTypeId?.unit ? ` ${item.testTypeId.unit}` : ""}
                          </p>
                        </div>
                        <div>
                          <div className={`form-badge ${item.resultValue !== null ? "form-badge-success" : "form-badge-neutral"}`}>
                            {item.resultValue !== null ? `Result: ${item.resultValue}${item.testTypeId?.unit ? ` ${item.testTypeId.unit}` : ""}` : "Pending"}
                          </div>
                          {item.notes && <p className="form-note">{item.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link to={backPath} className="form-link">
                Return to dashboard
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RequestDetail;
