import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateRequest = () => {
  const navigate = useNavigate();

  const [testTypes, setTestTypes] = useState([]);
  const [patientResult, setPatientResult] = useState(null); // found patient
  const [patientSearch, setPatientSearch] = useState("");   // typed patient ID
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [formData, setFormData] = useState({
    patientId: "",
    testTypeIds: [],
    urgency: "normal",
    clinicalNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch test types on mount
  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const res = await api.get("/tests");
        setTestTypes(res.data.tests);
      } catch {
        setError("Failed to load test types");
      }
    };
    fetchTestTypes();
  }, []);

  // Search patient by custom patientCode (e.g. P-001)
  const handlePatientSearch = async () => {
    if (!patientSearch.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    setPatientResult(null);
    try {
      const res = await api.get(`/users/search?patientCode=${patientSearch.trim()}`);
      if (res.data.user) {
        setPatientResult(res.data.user);
        setFormData((prev) => ({ ...prev, patientId: res.data.user._id }));
      } else {
        setSearchError("No patient found with this ID.");
      }
    } catch {
      setSearchError("No patient found with this ID.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Toggle pill selection
  const toggleTestType = (id) => {
    setFormData((prev) => ({
      ...prev,
      testTypeIds: prev.testTypeIds.includes(id)
        ? prev.testTypeIds.filter((t) => t !== id)
        : [...prev.testTypeIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patientId) return setError("Please search and confirm a patient first.");
    if (formData.testTypeIds.length === 0) return setError("Please select at least one test.");

    setLoading(true);
    try {
      await api.post("/requests", formData);
      navigate("/doctor");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "#252836",
    color: "#ffffff",
    border: "1px solid #2d3145",
    borderRadius: "8px",
    padding: "10px 15px",
  };

  const labelStyle = {
    color: "#a0aabf",
    fontSize: "14px",
    marginBottom: "8px",
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center py-5"
      style={{ backgroundColor: "#0f1117", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="container" style={{ maxWidth: "600px" }}>

        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button
            onClick={() => navigate("/doctor")}
            className="btn btn-link text-decoration-none p-0 me-3"
            style={{ color: "#4e8ef7", fontSize: "16px" }}
          >
            ← Back
          </button>
          <h2 className="fw-bold mb-0" style={{ color: "#ffffff" }}>
            New Lab Request
          </h2>
        </div>

        {/* Card */}
        <div
          className="card shadow-lg border-0"
          style={{ backgroundColor: "#1a1d27", borderRadius: "16px" }}
        >
          <div className="card-body p-4 p-md-5">
            {error && (
              <div
                className="alert border-0 small mb-4"
                style={{ backgroundColor: "#2d1f1a", color: "#ef4444", borderRadius: "8px" }}
              >
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ── Patient Search ───────────────────────────── */}
              <div className="mb-4">
                <label className="form-label fw-medium" style={labelStyle}>
                  Patient ID
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setPatientResult(null);
                      setFormData((prev) => ({ ...prev, patientId: "" }));
                      setSearchError("");
                    }}
                    placeholder="e.g. P-001"
                    className="form-control"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={handlePatientSearch}
                    disabled={searchLoading}
                    className="btn fw-semibold px-4"
                    style={{
                      backgroundColor: "#4e8ef7",
                      color: "#fff",
                      borderRadius: "8px",
                      border: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {searchLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : "Search"}
                  </button>
                </div>

                {/* Search error */}
                {searchError && (
                  <p className="small mt-2 mb-0" style={{ color: "#ef4444" }}>
                    ❌ {searchError}
                  </p>
                )}

                {/* Found patient card */}
                {patientResult && (
                  <div
                    className="mt-2 p-3 rounded-3 d-flex align-items-center gap-3"
                    style={{ backgroundColor: "#1a2535", border: "1px solid #4e8ef7" }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: 40, height: 40,
                        backgroundColor: "#4e8ef7",
                        color: "#fff", fontSize: 16, flexShrink: 0,
                      }}
                    >
                      {patientResult.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ color: "#fff" }}>
                        {patientResult.name}
                      </div>
                      <div className="small" style={{ color: "#6c757d" }}>
                        {patientResult.email} · {patientResult.patientCode}
                      </div>
                    </div>
                    <span className="ms-auto badge" style={{ backgroundColor: "#1e3a1e", color: "#4ade80" }}>
                      ✓ Confirmed
                    </span>
                  </div>
                )}
              </div>

              {/* ── Test Types (Pills) ───────────────────────── */}
              <div className="mb-4">
                <label className="form-label fw-medium" style={labelStyle}>
                  Select Tests
                </label>
                {testTypes.length === 0 ? (
                  <p className="small" style={{ color: "#6c757d" }}>Loading test types...</p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {testTypes.map((t) => {
                      const selected = formData.testTypeIds.includes(t._id);
                      return (
                        <button
                          key={t._id}
                          type="button"
                          onClick={() => toggleTestType(t._id)}
                          className="btn btn-sm fw-medium"
                          style={{
                            borderRadius: "20px",
                            border: `1px solid ${selected ? "#4e8ef7" : "#2d3145"}`,
                            backgroundColor: selected ? "#1a2535" : "#252836",
                            color: selected ? "#4e8ef7" : "#adb5bd",
                            transition: "all 0.15s",
                          }}
                        >
                          {selected ? "✓ " : ""}{t.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {formData.testTypeIds.length > 0 && (
                  <p className="small mt-2 mb-0" style={{ color: "#4e8ef7" }}>
                    {formData.testTypeIds.length} test{formData.testTypeIds.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {/* ── Urgency ──────────────────────────────────── */}
              <div className="mb-4">
                <label className="form-label fw-medium" style={labelStyle}>
                  Urgency
                </label>
                <div className="d-flex gap-3">
                  {["normal", "urgent"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, urgency: level }))}
                      className="btn fw-medium flex-fill"
                      style={{
                        borderRadius: "10px",
                        border: `1px solid ${
                          formData.urgency === level
                            ? level === "urgent" ? "#ff6b6b" : "#4e8ef7"
                            : "#2d3145"
                        }`,
                        backgroundColor: formData.urgency === level
                          ? level === "urgent" ? "#2d1b1b" : "#1a2535"
                          : "#252836",
                        color: formData.urgency === level
                          ? level === "urgent" ? "#ff6b6b" : "#4e8ef7"
                          : "#adb5bd",
                      }}
                    >
                      {level === "urgent" ? "🚨 Urgent" : "🟢 Normal"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Clinical Notes ───────────────────────────── */}
              <div className="mb-4">
                <label className="form-label fw-medium" style={labelStyle}>
                  Clinical Notes <span style={{ color: "#6c757d" }}>(optional)</span>
                </label>
                <textarea
                  name="clinicalNotes"
                  value={formData.clinicalNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clinicalNotes: e.target.value }))}
                  rows={4}
                  placeholder="Any specific instructions for the lab technician..."
                  className="form-control"
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {/* ── Submit ───────────────────────────────────── */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-100 fw-semibold mt-2"
                style={{
                  backgroundColor: "#4e8ef7",
                  color: "#ffffff",
                  borderRadius: "10px",
                  padding: "12px",
                  border: "none",
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Submitting...
                  </>
                ) : "Submit Lab Request"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;