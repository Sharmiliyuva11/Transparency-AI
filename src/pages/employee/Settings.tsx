import { useState } from "react";

const tabs = [
  { key: "profile", label: "Profile" },
  { key: "organization", label: "Organization" },
  { key: "ai", label: "AI Settings" },
  { key: "notifications", label: "Notifications" }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);

  return (
    <div className="settings-card">
      <div className="tab-strip">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button${activeTab === tab.key ? " active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "profile" && (
        <div className="tab-panel">
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="full-name">Full Name</label>
              <input id="full-name" className="input-field" defaultValue="John Smith" />
            </div>
            <div className="settings-field">
              <label htmlFor="email">Email Address</label>
              <input id="email" className="input-field" defaultValue="john.smith@example.com" />
            </div>
            <div className="settings-field">
              <label htmlFor="department">Department</label>
              <input id="department" className="input-field" defaultValue="Finance" />
            </div>
          </div>
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="current-password">Current Password</label>
              <input id="current-password" type="password" className="input-field" defaultValue="" placeholder="••••••••" />
            </div>
            <div className="settings-field">
              <label htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" className="input-field" />
            </div>
            <div className="settings-field">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input id="confirm-password" type="password" className="input-field" />
            </div>
          </div>
          <button className="primary-button" style={{ width: 180 }}>Save Changes</button>
        </div>
      )}
      {activeTab === "organization" && (
        <div className="tab-panel">
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="org-name">Organization Name</label>
              <input id="org-name" className="input-field" defaultValue="Tech Innovations Inc" />
            </div>
            <div className="settings-field">
              <label htmlFor="org-logo">Organization Logo</label>
              <button className="primary-button" style={{ width: 200 }}>Upload New Logo</button>
            </div>
          </div>
          <div className="settings-field">
            <label htmlFor="policy">Company Policy &amp; Guidelines</label>
            <textarea
              id="policy"
              className="textarea-field"
              defaultValue="All expenses must be submitted within 30 days. Receipts are required for all expenses over $50. Travel expenses require pre-approval for amounts exceeding $1,000."
            />
          </div>
          <button className="primary-button" style={{ width: 220 }}>Save Organization Settings</button>
        </div>
      )}
      {activeTab === "ai" && (
        <div className="tab-panel">
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="anomaly">Enable Anomaly Detection</label>
              <select id="anomaly" className="input-field" defaultValue="enabled">
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="settings-field">
              <label htmlFor="auto-approve">Auto-approval Threshold</label>
              <input id="auto-approve" className="input-field" defaultValue="$100" />
            </div>
            <div className="settings-field">
              <label htmlFor="ocr-provider">OCR Provider</label>
              <input id="ocr-provider" className="input-field" defaultValue="PaddleOCR" />
            </div>
          </div>
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="api-key">API Key</label>
              <input id="api-key" className="input-field" defaultValue="••••••••••" />
            </div>
            <div className="settings-field">
              <label htmlFor="model-version">Model Version</label>
              <input id="model-version" className="input-field" defaultValue="v2.3.1" />
            </div>
            <div className="settings-field">
              <label htmlFor="confidence">Confidence Threshold</label>
              <input id="confidence" className="input-field" defaultValue="85%" />
            </div>
          </div>
          <button className="primary-button" style={{ width: 180 }}>Save AI Settings</button>
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="tab-panel">
          <div className="settings-grid">
            <div className="settings-field">
              <label>Email Notifications</label>
              <div className="toggle-column">
                <label><input type="checkbox" defaultChecked /> Expense approved</label>
                <label><input type="checkbox" defaultChecked /> Expense flagged by AI</label>
                <label><input type="checkbox" /> New user added</label>
                <label><input type="checkbox" defaultChecked /> Weekly summary report</label>
              </div>
            </div>
            <div className="settings-field">
              <label>In-App Notifications</label>
              <div className="toggle-column">
                <label><input type="checkbox" defaultChecked /> Browser notifications</label>
                <label><input type="checkbox" /> Sound alerts</label>
              </div>
            </div>
          </div>
          <button className="primary-button" style={{ width: 220 }}>Save Notification Settings</button>
        </div>
      )}
      <div className="support-card">
        <div>
          <strong>Support &amp; Help</strong>
          <p>Need assistance? Contact our support team or check our documentation.</p>
        </div>
        <div className="support-actions">
          <button className="filter-chip">View Documentation</button>
          <button className="filter-chip">Contact Support</button>
        </div>
      </div>
    </div>
  );
}
