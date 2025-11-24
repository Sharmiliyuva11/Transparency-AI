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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        const userRole = data.user.role;
        const roleObj = roles.find((r) => r.key === userRole);
        navigate(roleObj?.path || "/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
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
          {error && (
            <div
              style={{
                background: "rgba(255, 107, 107, 0.15)",
                border: "1px solid rgba(255, 107, 107, 0.4)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "13px",
                color: "#ff7f7f"
              }}
            >
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="admin@example.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="utility-row">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a className="secondary-link" href="/forgot-password">
              Forgot Password?
            </a>
          </div>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="divider" />
          <div className="switch-link">
            Don&apos;t have an account? <a href="/signup">Sign up</a>
          </div>
        </form>
      </section>
    </div>
  );
}
