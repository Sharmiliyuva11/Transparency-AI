import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiMoon, FiShield, FiSun, FiZap, FiArrowLeft } from "react-icons/fi";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useTheme } from "../context/ThemeContext";

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

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      setSuccess("Verification code sent to your email. Check your inbox.");
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!code) {
      setError("Verification code is required");
      return;
    }

    if (code.length !== 6) {
      setError("Verification code must be 6 characters");
      return;
    }

    setLoading(true);

    try {
      setSuccess("Code verified! Enter your new password.");
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
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
            <h2>Reset Password</h2>
            <p className="dashboard-subtitle">
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "verify" && "Enter the verification code sent to your email"}
              {step === "reset" && "Create a new password for your account"}
            </p>
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

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="form-column">
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
            {success && (
              <div
                style={{
                  background: "rgba(56, 215, 136, 0.15)",
                  border: "1px solid rgba(56, 215, 136, 0.4)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#38d788"
                }}
              >
                {success}
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
                placeholder="your@example.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: "1.5"
              }}
            >
              We'll send you a 6-digit verification code to reset your password
            </p>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
            <div className="divider" />
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                background: "transparent",
                color: "var(--accent-blue)",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <FiArrowLeft size={16} />
              Back to Login
            </button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerifySubmit} className="form-column">
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
            {success && (
              <div
                style={{
                  background: "rgba(56, 215, 136, 0.15)",
                  border: "1px solid rgba(56, 215, 136, 0.4)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#38d788"
                }}
              >
                {success}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="code">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                required
                placeholder="000000"
                className="input-field"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                style={{ fontFamily: "monospace", letterSpacing: "8px", fontSize: "20px", textAlign: "center" }}
              />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: "1.5"
              }}
            >
              Enter the 6-digit code we sent to <strong>{email}</strong>
            </p>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <div className="divider" />
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setSuccess(null);
              }}
              style={{
                background: "transparent",
                color: "var(--accent-blue)",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid var(--border-soft)",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              ← Back to Email
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetSubmit} className="form-column">
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
            {success && (
              <div
                style={{
                  background: "rgba(56, 215, 136, 0.15)",
                  border: "1px solid rgba(56, 215, 136, 0.4)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#38d788"
                }}
              >
                {success}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-password">
                Confirm Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: "1.5"
              }}
            >
              Make sure your new password is at least 6 characters long and includes a mix of characters
            </p>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <div className="divider" />
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                background: "transparent",
                color: "var(--accent-blue)",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <FiArrowLeft size={16} />
              Back to Login
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
