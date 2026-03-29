import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/users/login", formData);
      login(res.data.user, res.data.token);

      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "doctor") navigate("/doctor");
      else if (role === "technician") navigate("/technician");
      else navigate("/patient");

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#0f1117" }}
    >
      <div
        className="card p-4 border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#1a1d27",
          borderRadius: "16px",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: "#4e8ef7" }}>🧬 LabTrack</h2>
          <p className="small" style={{ color: "#6c757d" }}>
            Medical Lab Test & Results Platform
          </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label small fw-medium" style={{ color: "#adb5bd" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="form-control border-0"
              style={{
                backgroundColor: "#252836",
                color: "#ffffff",
                borderRadius: "10px",
                padding: "12px 16px",
              }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-medium" style={{ color: "#adb5bd" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="form-control border-0"
              style={{
                backgroundColor: "#252836",
                color: "#ffffff",
                borderRadius: "10px",
                padding: "12px 16px",
              }}
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
                Signing in...
              </>
            ) : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="d-flex align-items-center my-4">
          <hr className="flex-grow-1" style={{ borderColor: "#2d3145" }} />
          <span className="px-3 small" style={{ color: "#6c757d" }}>Roles</span>
          <hr className="flex-grow-1" style={{ borderColor: "#2d3145" }} />
        </div>

        {/* Role badges */}
        <div className="row g-2 mb-4">
          {[
            { role: "Admin",    icon: "⚙️",  bg: "#1e2235", color: "#a78bfa" },
            { role: "Doctor",   icon: "👨‍⚕️", bg: "#1a2535", color: "#4e8ef7" },
            { role: "Lab Tech", icon: "🔬",  bg: "#1a2520", color: "#34d399" },
            { role: "Patient",  icon: "🧑‍⚕️", bg: "#252018", color: "#fbbf24" },
          ].map((item) => (
            <div key={item.role} className="col-3">
              <div
                className="text-center py-2 rounded"
                style={{
                  backgroundColor: item.bg,
                  color: item.color,
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
              >
                <div className="fs-5">{item.icon}</div>
                <div className="fw-medium">{item.role}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center small mb-0" style={{ color: "#6c757d" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4e8ef7" }} className="fw-medium text-decoration-none">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;