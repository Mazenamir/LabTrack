import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateRequest = () => {
  const navigate = useNavigate();
  const [testTypes, setTestTypes] = useState([]);
  const [patientResult, setPatientResult] = useState(null);
  const [patientResults, setPatientResults] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
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

  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const res = await api.get("/tests");
        setTestTypes(res.data.tests || []);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.msg || "Failed to load test types.");
      }
    };

    fetchTestTypes();
  }, []);

  const handlePatientSearch = async () => {
    const query = patientSearch.trim();
    if (!query) return;

    setSearchLoading(true);
    setSearchError("");
    setPatientResult(null);
    setPatientResults([]);
    setFormData((prev) => ({ ...prev, patientId: "" }));

    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      const users = res.data.users || [];

      if (users.length === 1) {
        setPatientResult(users[0]);
        setFormData((prev) => ({ ...prev, patientId: users[0]._id }));
      } else if (users.length > 1) {
        setPatientResults(users);
      } else {
        setSearchError("No patient found with this name or code.");
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || err.response?.data?.msg || "No patient found with this name or code.");
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleTestType = (id) => {
    setFormData((prev) => ({
      ...prev,
      testTypeIds: prev.testTypeIds.includes(id)
        ? prev.testTypeIds.filter((item) => item !== id)
        : [...prev.testTypeIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patientId) {
      setError("Please search and confirm a patient first.");
      return;
    }

    if (formData.testTypeIds.length === 0) {
      setError("Please select at least one test.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/requests", {
        patientId: formData.patientId,
        testTypeIds: formData.testTypeIds,
        urgency: formData.urgency,
        notes: formData.clinicalNotes,
      });
      navigate("/doctor");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-shell">
        <section className="form-panel">
          <div className="form-header">
            <div>
              <Link to="/doctor" className="form-back">
                Back to doctor dashboard
              </Link>
              <p className="form-eyebrow">New Request</p>
              <h2 className="form-title">Create a lab request</h2>
              <p className="form-subtitle">Search for a patient, pick the requested tests, and send the request to the lab.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {error && <div className="form-alert">{error}</div>}

            <div className="form-field">
              <label htmlFor="patientSearch">Patient name or code</label>
              <div className="form-search-row">
                <input
                  id="patientSearch"
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setPatientResult(null);
                    setPatientResults([]);
                    setFormData((prev) => ({ ...prev, patientId: "" }));
                    setSearchError("");
                  }}
                  placeholder="Search by patient name or code"
                  className="form-input"
                />
                <button type="button" className="dashboard-button dashboard-button-secondary" onClick={handlePatientSearch} disabled={searchLoading}>
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>
              {searchError && <p className="form-note" style={{ color: "#a74432" }}>{searchError}</p>}
              {patientResults.length > 1 && (
                <div className="form-note">
                  <p>Select a patient from the results below:</p>
                  {patientResults.map((user) => (
                    <button
                      type="button"
                      key={user._id}
                      className="form-pill"
                      onClick={() => {
                        setPatientResult(user);
                        setFormData((prev) => ({ ...prev, patientId: user._id }));
                        setPatientResults([]);
                      }}
                    >
                      <strong>{user.name}</strong>
                      <span>{user.email} - {user.patientCode}</span>
                    </button>
                  ))}
                </div>
              )}
              {patientResult && (
                <div className="form-pill">
                  <strong>{patientResult.name}</strong>
                  <span>{patientResult.email} - {patientResult.patientCode}</span>
                </div>
              )}
            </div>

            <div className="form-field">
              <label>Select tests</label>
              <div className="form-chip-grid">
                {testTypes.map((testType) => {
                  const isActive = formData.testTypeIds.includes(testType._id);
                  return (
                    <button
                      key={testType._id}
                      type="button"
                      className={`form-chip ${isActive ? "is-active" : ""}`}
                      onClick={() => toggleTestType(testType._id)}
                    >
                      <strong>{testType.name}</strong>
                      <span>{testType.category || "Lab test"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Urgency</label>
                <div className="form-chip-grid">
                  {["normal", "urgent"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`form-chip ${formData.urgency === level ? "is-active" : ""}`}
                      onClick={() => setFormData((prev) => ({ ...prev, urgency: level }))}
                    >
                      <strong>{level === "urgent" ? "Urgent" : "Normal"}</strong>
                      <span>{level === "urgent" ? "Prioritize this request" : "Standard processing"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="clinicalNotes">Clinical notes</label>
                <textarea
                  id="clinicalNotes"
                  className="form-textarea"
                  value={formData.clinicalNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clinicalNotes: e.target.value }))}
                  placeholder="Any notes for the lab team"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="form-submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit request"}
              </button>
              <Link to="/doctor" className="form-link">
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default CreateRequest;
