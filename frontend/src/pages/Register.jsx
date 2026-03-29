import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialization: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await api.post("/users/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "#252836",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "12px 16px",
    border: "none",
  };

  const labelStyle = {
    color: "#adb5bd",
    fontSize: "14px",
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ backgroundColor: "#0f1117" }}
    >
      <div
        className="card p-4 border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#1a1d27",
          borderRadius: "16px",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: "#4e8ef7" }}>🧬 LabTrack</h2>
          <p className="small" style={{ color: "#6c757d" }}>Create your account</p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="alert border-0 py-2 small mb-3"
            style={{ backgroundColor: "#2d1b1b", color: "#ff6b6b" }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label fw-medium" style={labelStyle}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ahmed Ali"
              className="form-control"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-medium" style={labelStyle}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="form-control"
              style={inputStyle}
            />
          </div>

          {/* Role Selector */}
          <div className="mb-3">
            <label className="form-label fw-medium" style={labelStyle}>
              I am a...
            </label>
            <div className="row g-2">
              {[
                { value: "patient", label: "Patient", icon: "🧑‍⚕️" },
                { value: "doctor",  label: "Doctor",  icon: "👨‍⚕️" },
              ].map((item) => (
                <div key={item.value} className="col-6">
                  <div
                    onClick={() => setFormData({ ...formData, role: item.value })}
                    className="text-center py-3 rounded cursor-pointer"
                    style={{
                      backgroundColor: formData.role === item.value ? "#1a2535" : "#252836",
                      border: formData.role === item.value ? "2px solid #4e8ef7" : "2px solid transparent",
                      borderRadius: "10px",
                      cursor: "pointer",
                      color: formData.role === item.value ? "#4e8ef7" : "#adb5bd",
                      transition: "all 0.2s",
                    }}
                  >
                    <div className="fs-4">{item.icon}</div>
                    <div className="small fw-medium">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialization — doctors only */}
          {formData.role === "doctor" && (
            <div className="mb-3">
              <label className="form-label fw-medium" style={labelStyle}>
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
                className="form-control"
                style={inputStyle}
              />
            </div>
          )}

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label fw-medium" style={labelStyle}>
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01012345678"
              className="form-control"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-medium" style={labelStyle}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min. 6 characters"
              className="form-control"
              style={inputStyle}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label fw-medium" style={labelStyle}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="form-control"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 fw-semibold"
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
                Creating account...
              </>
            ) : "Create Account"}
          </button>

        </form>

        <p className="text-center small mt-3 mb-0" style={{ color: "#6c757d" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#4e8ef7" }}
            className="fw-medium text-decoration-none"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;