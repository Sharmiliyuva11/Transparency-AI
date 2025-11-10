import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiMoon, FiShield, FiSun, FiZap } from "react-icons/fi";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useTheme } from "../context/ThemeContext";

const roles = [
  { key: "admin", label: "Admin", path: "/dashboard/admin" },
  { key: "employee", label: "Employee", path: "/dashboard/employee" },
  { key: "auditor", label: "Auditor", path: "/dashboard/auditor" }
];

const features = [
  {
    title: "Smart Receipt Scanning",
    description: "AI-powered OCR extracts data from receipts automatically",
    icon: <HiOutlineDocumentSearch />
  },
  {
    title: "Real-time Fraud Detection",
    description: "Advanced algorithms identify anomalies and suspicious patterns",
    icon: <FiZap />
  },
  {
    title: "Automated Verification",
    description: "Instant validation and categorization of all expenses",
    icon: <FiShield />
  }
];

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState(roles[0]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(activeRole.path);
  };

  return (
    <div className="login-page">
      <section className="login-info">
        <div>
          <h2>AI Expense Transparency</h2>
          <h1>Ensuring Financial Trust Through AI-Driven Verification</h1>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              {feature.icon}
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="login-panel">
        <div className="login-header">
          <div>
            <h2>Welcome Back</h2>
            <p className="dashboard-subtitle">Sign in to access your dashboard</p>
          </div>
          <div className="login-actions">
            <button type="button" className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>
            <div className="icon-button" aria-hidden="true">
              <FiFileText />
            </div>
          </div>
        </div>
        <div className="auth-tabs">
          {roles.map((role) => (
            <button
              key={role.key}
              className={`auth-tab${activeRole.key === role.key ? " active" : ""}`}
              onClick={() => setActiveRole(role)}
              type="button"
            >
              {role.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="form-column">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input id="email" type="email" required placeholder="admin@example.com" className="input-field" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input id="password" type="password" required placeholder="••••••••" className="input-field" />
          </div>
          <div className="utility-row">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a className="secondary-link" href="#">
              Forgot Password?
            </a>
          </div>
          <button type="submit" className="primary-button">
            Sign In
          </button>
          <div className="divider" />
          <div className="switch-link">
            Don&apos;t have an account? <a href="#">Sign up</a>
          </div>
        </form>
      </section>
    </div>
  );
}
