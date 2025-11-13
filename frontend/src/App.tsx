import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

import AIAssistantPage from './pages/AIAssistantPage'
import SettingsPage from './pages/SettingsPage'
import { AuditorDashboard } from './pages/AuditorDashboard'

function App() {
  return (
    <Router>
      <div className="app-root">
        <aside className="app-sidenav">
          <div className="brand">AI Expense Transparency</div>
          <nav>
            <div className="nav-group">General</div>
            <ul>
              <li><Link to="/admin/ai">Admin - AI Assistant</Link></li>
              <li><Link to="/admin/settings">Admin - Settings</Link></li>
              <li><Link to="/auditor/anomaly-review">Auditor - Anomaly Review</Link></li>
              <li><Link to="/auditor/ai">Auditor - AI Assistant</Link></li>
              <li><Link to="/auditor/settings">Auditor - Settings</Link></li>
              <li><Link to="/employee/ai">Employee - AI Assistant</Link></li>
              <li><Link to="/employee/settings">Employee - Settings</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="app-main">
          <Routes>
            <Route path="/admin/ai" element={<AIAssistantPage role="Admin" />} />
            <Route path="/auditor/anomaly-review" element={<AuditorDashboard />} />
            <Route path="/auditor/ai" element={<AIAssistantPage role="Auditor" />} />
            <Route path="/employee/ai" element={<AIAssistantPage role="Employee" />} />

            <Route path="/admin/settings" element={<SettingsPage role="Admin" />} />
            <Route path="/auditor/settings" element={<SettingsPage role="Auditor" />} />
            <Route path="/employee/settings" element={<SettingsPage role="Employee" />} />

            <Route path="/" element={<div style={{padding:24}}>Open the side links to view the pages.</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
