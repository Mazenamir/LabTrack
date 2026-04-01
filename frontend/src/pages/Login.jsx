import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const tools = ["Doctor workspace", "Technician flow", "Patient tracking", "Admin overview"];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (role === "doctor") navigate("/doctor");
      else if (role === "technician") navigate("/technician");
      else if (role === "admin") navigate("/admin");
      else navigate("/patient");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-large" />
      <div className="auth-orb auth-orb-small" />
      <div className="auth-stage">
        <div className="auth-brand auth-brand-center">
          <span className="auth-brand-badge auth-brand-badge-warm" />
          <span>LabTrack</span>
        </div>

        <div className="auth-hero">
          <p className="auth-overline">Lab management system</p>
          <h1 className="auth-hero-title">Good to see you again</h1>
          <p className="auth-hero-copy">Sign in to continue managing requests, samples, and results.</p>
        </div>

        <section className="auth-card auth-card-centered">
          <form className="auth-form auth-form-tight" onSubmit={handleSubmit}>
            {error && <div className="auth-alert">{error}</div>}

            <div className="auth-field">
              <label htmlFor="email">Your email</label>
              <div className="auth-input-row">
                <span className="auth-input-icon">@</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. doctor@labtrack.com"
                  className="auth-input auth-input-plain"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Your password</label>
              <div className="auth-input-row">
                <span className="auth-input-icon">*</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="auth-input auth-input-plain"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-submit auth-submit-bright">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-links-row">
            <Link to="/register">Don&apos;t have an account?</Link>
            <Link to="/register">Create account</Link>
          </div>
        </section>

        <div className="auth-tool-row">
          {tools.map((tool) => (
            <div key={tool} className="auth-tool-chip">
              <span className="auth-tool-dot" />
              <span>{tool}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
