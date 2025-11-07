import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiSun } from 'react-icons/fi'

const featureCards = [
  {
    title: 'Smart Receipt Scanning',
    description: 'AI-powered OCR extracts data from receipts automatically',
    icon: '🧾',
  },
  {
    title: 'Real-time Fraud Detection',
    description: 'Advanced algorithms identify anomalies and suspicious patterns',
    icon: '📊',
  },
  {
    title: 'Automated Verification',
    description: 'Instant validation and categorization of all expenses',
    icon: '✅',
  },
]

const roleTabs = [
  { label: 'Admin', value: 'admin' },
  { label: 'Employee', value: 'employee' },
  { label: 'Auditor', value: 'auditor' },
]

export default function Landing() {
  const [role, setRole] = useState('admin')
  const navigate = useNavigate()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(`/${role}`)
  }

  return (
    <div className="landing-shell">
      <div className="landing-panel">
        <div className="landing-brand">
          <div className="brand-icon">🛡️</div>
          <div>
            <h1>AI Expense Transparency</h1>
            <p>Ensuring Financial Trust Through AI-Driven Verification</p>
          </div>
        </div>
        <div className="landing-features">
          {featureCards.map((card) => (
            <div className="feature-card" key={card.title}>
              <span>{card.icon}</span>
              <div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="landing-divider" />
      <div className="login-panel">
        <div className="login-header">
          <button className="icon-button" type="button">
            <FiSun />
          </button>
        </div>
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p>Sign in to access your dashboard</p>
          <div className="role-tabs">
            {roleTabs.map((tab) => (
              <button
                key={tab.value}
                className={`role-tab${tab.value === role ? ' active' : ''}`}
                type="button"
                onClick={() => setRole(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Email Address
              <div className="input-field">
                <FiMail />
                <input defaultValue="admin@example.com" placeholder="you@example.com" type="email" />
              </div>
            </label>
            <label>
              Password
              <div className="input-field">
                <FiLock />
                <input placeholder="••••••••" type="password" />
              </div>
            </label>
            <div className="login-row">
              <label className="checkbox">
                <input type="checkbox" />
                Remember me
              </label>
              <button className="link" type="button">
                Forgot Password?
              </button>
            </div>
            <button className="primary-button" type="submit">
              Sign In
            </button>
          </form>
          <p className="signup-hint">
            Don't have an account? <span className="link">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  )
}
