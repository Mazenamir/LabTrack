import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const roles = [
  { value: "patient", label: "Patient", hint: "Track your lab requests and results." },
  { value: "doctor", label: "Doctor", hint: "Create requests and follow case progress." },
  { value: "technician", label: "Technician", hint: "Review queue items and update status." },
];

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData((current) => ({
      ...current,
      role,
      specialization: role === "patient" ? "" : current.specialization,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/users/register", formData);
      const patientCode = res.data.user?.patientCode;
      if (formData.role === "patient" && patientCode) {
        const message = `Registration successful! Your patient code is ${patientCode}. Please save it for future requests.`;
        setSuccess(message);
        window.alert(message);
      } else {
        setSuccess("Registration successful! Please log in.");
      }
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-large" />
      <div className="auth-orb auth-orb-small auth-orb-right" />
      <div className="auth-stage">
        <div className="auth-brand auth-brand-center">
          <span className="auth-brand-badge auth-brand-badge-warm" />
          <span>LabTrack</span>
        </div>

        <div className="auth-hero">
          <p className="auth-overline">Create account</p>
          <h1 className="auth-hero-title">Join the workspace</h1>
          <p className="auth-hero-copy">Set up your profile and start using the platform in a few steps.</p>
        </div>

        <section className="auth-card auth-card-centered auth-card-wide">
          <form className="auth-form auth-form-tight" onSubmit={handleSubmit}>
            {error && <div className="auth-alert">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <div className="auth-field">
              <label>I am registering as</label>
              <div className="auth-role-grid">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    className={`auth-role-button ${formData.role === role.value ? "is-active" : ""}`}
                    onClick={() => handleRoleChange(role.value)}
                  >
                    <strong>{role.label}</strong>
                    <span>{role.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="name">Full name</label>
                <div className="auth-input-row">
                  <span className="auth-input-icon">A</span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Smith"
                    className="auth-input auth-input-plain"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="phone">Phone</label>
                <div className="auth-input-row">
                  <span className="auth-input-icon">#</span>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01012345678"
                    className="auth-input auth-input-plain"
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-row">
                <span className="auth-input-icon">@</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@hospital.com"
                  className="auth-input auth-input-plain"
                />
              </div>
            </div>

            {(formData.role === "doctor" || formData.role === "technician") && (
              <div className="auth-field">
                <label htmlFor="specialization">Specialization</label>
                <div className="auth-input-row">
                  <span className="auth-input-icon">+</span>
                  <input
                    id="specialization"
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Hematology or microbiology"
                    className="auth-input auth-input-plain"
                  />
                </div>
              </div>
            )}

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-input-row">
                  <span className="auth-input-icon">*</span>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimum 6 characters"
                    className="auth-input auth-input-plain"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="auth-input-row">
                  <span className="auth-input-icon">*</span>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repeat your password"
                    className="auth-input auth-input-plain"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-submit auth-submit-bright">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="auth-links-row">
            <Link to="/login">Already have an account?</Link>
            <Link to="/login">Sign in</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
