import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-role" style={{ color: "#a74432" }}>
                Access denied
              </p>
              <h2>You do not have permission to open this page.</h2>
              <p>Please sign in with the correct account or go back to the login screen.</p>
            </div>
          </div>
          <Link className="dashboard-link" to="/login">
            Back to login
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Unauthorized;
