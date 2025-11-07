import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  FiActivity,
  FiCamera,
  FiCloudLightning,
  FiUploadCloud,
  FiFileText,
  FiFolder,
  FiGrid,
  FiHome,
  FiLayers,
  FiLogOut,
  FiSettings,
  FiTrendingUp
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa6";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";

const pipelineSteps = [
  { title: "OCR Extraction", description: "AI captures receipt text instantly" },
  { title: "Data Cleaning", description: "Normalizes amounts and vendors" },
  { title: "NLP Classification", description: "Categorizes spend automatically" },
  { title: "Fraud Detection", description: "Flags anomalies for review" }
];

const recentUploads = [
  { file: "Receipt_Nov01.pdf", date: "2025-11-01", status: "Processed" },
  { file: "Taxi_Trip_1028.png", date: "2025-10-28", status: "Processing" },
  { file: "Dinner_Team_1025.jpg", date: "2025-10-25", status: "Flagged" }
];

const statusBadges: Record<string, string> = {
  Processed: "badge green",
  Processing: "badge yellow",
  Flagged: "badge red"
};

const spendingByCategory = [
  { name: "Travel", value: 45, color: "#3ba8ff" },
  { name: "Food", value: 30, color: "#38d788" },
  { name: "Office", value: 25, color: "#ffa94d" }
];

const monthlyTrend = [
  { month: "Jul", value: 420 },
  { month: "Aug", value: 380 },
  { month: "Sep", value: 450 },
  { month: "Oct", value: 520 }
];

const recentExpenses = [
  { date: "2025-11-01", vendor: "Coffee Shop", amount: "$45", category: "Food", status: "Approved" },
  { date: "2025-10-30", vendor: "Uber", amount: "$28", category: "Travel", status: "Approved" },
  { date: "2025-10-28", vendor: "Office Depot", amount: "$120", category: "Office", status: "Pending" },
  { date: "2025-10-25", vendor: "Hotel XYZ", amount: "$250", category: "Travel", status: "Approved" },
  { date: "2025-10-22", vendor: "Restaurant", amount: "$85", category: "Food", status: "Approved" }
];

const expenseStatusBadges: Record<string, string> = {
  Approved: "badge green",
  Pending: "badge yellow",
  Rejected: "badge red"
};

type Section = "overview" | "upload" | "assistant" | "settings";

export default function EmployeeDashboard() {
  const [currentSection, setCurrentSection] = useState<Section>("overview");

  const sidebarLinks = [
    { label: "Dashboard Overview", icon: <FiGrid />, onClick: () => setCurrentSection("overview") },
    { label: "Upload Receipt", icon: <FiUploadCloud />, onClick: () => setCurrentSection("upload") },
    { label: "AI Assistant", icon: <FaRobot />, onClick: () => setCurrentSection("assistant") },
    { label: "Settings", icon: <FiSettings />, onClick: () => setCurrentSection("settings") }
  ];

  const renderContent = () => {
    switch (currentSection) {
      case "overview":
        return (
          <>
            <div className="grid cols-4">
              <div className="stat-card">
                <div className="stat-label">My Total Expenses</div>
                <div className="stat-value">$728</div>
                <div className="stat-label">This month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Receipts Uploaded</div>
                <div className="stat-value">12</div>
                <div className="stat-label">Total submissions</div>
              </div>
              <div className="stat-card accent-yellow">
                <div className="stat-label">Pending Review</div>
                <div className="stat-value">4</div>
                <div className="stat-label">Awaiting approval</div>
              </div>
              <div className="stat-card accent-green">
                <div className="stat-label">Policy Compliance</div>
                <div className="stat-value">96%</div>
                <div className="stat-label">+4% vs last month</div>
              </div>
            </div>
            <div className="grid cols-2">
              <div className="section-card">
                <div className="section-header">
                  <h3>My Spending by Category</h3>
                </div>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={spendingByCategory} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={6}>
                        {spendingByCategory.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid cols-3">
                  {spendingByCategory.map((item) => (
                    <div key={item.name} className="stat-label">
                      <span className="badge blue" style={{ background: `${item.color}33`, color: item.color }}>
                        {item.value}%
                      </span>
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="section-card">
                <div className="section-header">
                  <h3>My Monthly Spending Trend</h3>
                </div>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={monthlyTrend}>
                      <XAxis dataKey="month" stroke="#5870a5" dy={6} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ stroke: "#3ba8ff", strokeWidth: 1 }}
                        contentStyle={{ background: "#0c1736", borderRadius: 12, border: "1px solid rgba(71,102,190,0.45)" }}
                        labelStyle={{ color: "#99a5cc" }}
                        itemStyle={{ color: "#e6ecff" }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#3ba8ff" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="section-card">
              <div className="section-header">
                <h3>My Recent Expenses</h3>
                <a className="secondary-link" href="#">
                  View All
                </a>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((expense) => (
                    <tr key={expense.vendor + expense.date}>
                      <td>{expense.date}</td>
                      <td>{expense.vendor}</td>
                      <td>{expense.amount}</td>
                      <td>
                        <span className="badge blue">{expense.category}</span>
                      </td>
                      <td>
                        <span className={expenseStatusBadges[expense.status]}>{expense.status}</span>
                      </td>
                      <td>
                        <a className="secondary-link" href="#">
                          View
                        </a>{" "}
                        ·
                        <a className="secondary-link" href="#">
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="section-card">
              <div className="section-header">
                <h3>Tip: Optimize Your Expenses</h3>
              </div>
              <p className="dashboard-subtitle">
                Your travel expenses are 15% higher than your department average. Consider using company preferred vendors for better rates.
              </p>
            </div>
          </>
        );
      case "upload":
        return (
          <>
            <div className="grid cols-2">
              <div className="section-card" style={{ minHeight: 320 }}>
                <div className="section-header">
                  <h3>Document Upload</h3>
                  <span className="badge blue">Max 10 MB</span>
                </div>
                <div className="upload-dropzone">
                  <FiCamera size={36} color="#3ba8ff" />
                  <div>Drag & drop your receipt here</div>
                  <div className="dashboard-subtitle">or click to browse</div>
                  <button className="primary-button" style={{ width: 200 }}>Choose File</button>
                </div>
              </div>
              <div className="section-card" style={{ minHeight: 320 }}>
                <div className="section-header">
                  <h3>OCR Extraction Preview</h3>
                  <span className="badge yellow">Awaiting upload</span>
                </div>
                <div className="upload-preview" style={{ height: 220 }}>
                  Upload a document to see extracted data
                </div>
              </div>
            </div>
            <div className="section-card">
              <div className="section-header">
                <h3>AI Processing Pipeline</h3>
              </div>
              <div className="pipeline-grid">
                {pipelineSteps.map((step) => (
                  <div key={step.title} className="pipeline-step">
                    <FiCloudLightning />
                    <strong>{step.title}</strong>
                    <span>{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="section-card">
              <div className="section-header">
                <h3>Recent Uploads</h3>
                <a className="secondary-link" href="#">
                  View History
                </a>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th>Insights</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.map((item) => (
                    <tr key={item.file}>
                      <td>{item.file}</td>
                      <td>{item.date}</td>
                      <td>
                        <span className={statusBadges[item.status]}>{item.status}</span>
                      </td>
                      <td>
                        <div className="badge blue">Ready</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      case "assistant":
        return (
          <>
            <div className="section-card">
              <div className="section-header">
                <h3>Smart Auditor AI</h3>
                <span className="badge green">Online</span>
              </div>
              <div className="ai-intro">
                <div className="ai-avatar-large">
                  <FaRobot size={32} />
                </div>
                <div className="ai-intro-content">
                  <p><strong>Hello! I'm Smart Auditor AI, your intelligent expense assistant.</strong></p>
                  <p>I can help you with:</p>
                  <ul className="ai-capabilities">
                    <li>• Analyzing expense patterns and trends</li>
                    <li>• Explaining flagged transactions</li>
                    <li>• Providing insights on spending optimization</li>
                    <li>• Answering questions about your financial data</li>
                    <li>• Recommending cost-saving opportunities</li>
                  </ul>
                  <p><em>How can I assist you today?</em></p>
                </div>
              </div>
            </div>
            <div className="section-card">
              <div className="section-header">
                <h3>Current Status</h3>
                <span className="badge yellow">6 Anomalies Detected</span>
              </div>
              <div className="anomalies-summary">
                <div className="anomaly-group">
                  <h4>⚠ High Severity (2):</h4>
                  <ul>
                    <li>• Global Airlines - Duplicate receipt ($8,900)</li>
                    <li>• Cash Payment - Missing receipt documentation ($1,200)</li>
                  </ul>
                </div>
                <div className="anomaly-group">
                  <h4>⚡ Medium Severity (2):</h4>
                  <ul>
                    <li>• ABC Taxi - Excessive amount, 340% above average ($2,500)</li>
                    <li>• Restaurant XYZ - Date mismatch on receipt ($950)</li>
                  </ul>
                </div>
                <div className="anomaly-group">
                  <h4>✓ Low Severity (2):</h4>
                  <ul>
                    <li>• Unknown Store XYZ - New vendor, no history ($780)</li>
                    <li>• Hotel Chain - Unusual pattern detected ($450)</li>
                  </ul>
                </div>
                <div className="anomaly-footer">
                  <p>All have been assigned to admins for review. Average resolution time: 2.3 days.</p>
                </div>
              </div>
            </div>
            <div className="section-card">
              <div className="section-header">
                <h3>AI Chat Assistant</h3>
              </div>
              <div className="ai-chat-container">
                <div className="ai-chat-messages">
                  <div className="ai-message ai">
                    <div className="ai-avatar">
                      <FaRobot />
                    </div>
                    <div className="ai-message-content">
                      <p>Explain the recent anomalies detected</p>
                    </div>
                    <div className="ai-timestamp">02:09 pm</div>
                  </div>
                  <div className="ai-message ai response">
                    <div className="ai-avatar">
                      <FaRobot />
                    </div>
                    <div className="ai-message-content">
                      <p>Based on your recent expense submissions, here are the key anomalies I've identified:</p>
                      <div className="anomaly-details">
                        <p><strong>High Priority:</strong></p>
                        <ul>
                          <li><strong>Global Airlines ($8,900):</strong> This appears to be a duplicate submission. I found a similar transaction from 2 weeks ago for the same route and amount.</li>
                          <li><strong>Cash Payment ($1,200):</strong> This cash transaction lacks proper receipt documentation, which violates company policy for amounts over $500.</li>
                        </ul>
                        <p><strong>Medium Priority:</strong></p>
                        <ul>
                          <li><strong>ABC Taxi ($2,500):</strong> This fare is 340% above your typical taxi expenses. Please verify if this was for multiple passengers or special circumstances.</li>
                          <li><strong>Restaurant XYZ ($950):</strong> The receipt date doesn't match the transaction date in our system. This could be a data entry error.</li>
                        </ul>
                        <p><strong>Low Priority:</strong></p>
                        <ul>
                          <li><strong>Unknown Store XYZ ($780):</strong> This is a new vendor with no transaction history. Consider getting pre-approval for future purchases.</li>
                          <li><strong>Hotel Chain ($450):</strong> This booking shows an unusual pattern compared to your typical hotel stays.</li>
                        </ul>
                        <p>I've flagged these for admin review. You should receive notifications once they're processed. Would you like me to help you prepare explanations for any of these transactions?</p>
                      </div>
                    </div>
                    <div className="ai-timestamp">02:10 pm</div>
                  </div>
                </div>
                <div className="ai-chat-input">
                  <input type="text" placeholder="Ask me anything about your expenses..." className="ai-input" />
                  <button className="primary-button">Send</button>
                </div>
              </div>
            </div>
          </>
        );
      case "settings":
        return (
          <div className="grid cols-2">
            <div className="section-card">
              <div className="section-header">
                <h3>Account Settings</h3>
              </div>
              <div className="settings-group">
                <label className="settings-label">Email Notifications</label>
                <div className="settings-toggle">
                  <input type="checkbox" id="email-notifications" defaultChecked />
                  <label htmlFor="email-notifications">Receive expense approval notifications</label>
                </div>
                <div className="settings-toggle">
                  <input type="checkbox" id="weekly-reports" defaultChecked />
                  <label htmlFor="weekly-reports">Weekly spending summary</label>
                </div>
              </div>
              <div className="settings-group">
                <label className="settings-label">Privacy Settings</label>
                <div className="settings-toggle">
                  <input type="checkbox" id="data-sharing" />
                  <label htmlFor="data-sharing">Share anonymized data for AI improvements</label>
                </div>
              </div>
            </div>
            <div className="section-card">
              <div className="section-header">
                <h3>Expense Preferences</h3>
              </div>
              <div className="settings-group">
                <label className="settings-label">Default Currency</label>
                <select className="settings-select">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="settings-group">
                <label className="settings-label">Receipt Auto-Categorization</label>
                <div className="settings-toggle">
                  <input type="checkbox" id="auto-category" defaultChecked />
                  <label htmlFor="auto-category">Automatically categorize uploaded receipts</label>
                </div>
              </div>
              <div className="settings-group">
                <button className="primary-button" style={{ marginTop: 20 }}>Save Settings</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitleAndSubtitle = () => {
    switch (currentSection) {
      case "overview":
        return {
          title: "My Expense Dashboard",
          subtitle: "Track and manage your personal expenses"
        };
      case "upload":
        return {
          title: "Upload Expense Document",
          subtitle: "AI powered OCR will extract data automatically"
        };
      case "assistant":
        return {
          title: "AI Expense Assistant",
          subtitle: "Get insights and help with your expenses"
        };
      case "settings":
        return {
          title: "Account Settings",
          subtitle: "Manage your preferences and account details"
        };
      default:
        return {
          title: "My Expense Dashboard",
          subtitle: "Track and manage your personal expenses"
        };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <DashboardLayout
      appName="AI Expense Transparency"
      sidebarLinks={sidebarLinks}
      footerLinks={[{ label: "Reports", icon: <FiFileText /> }]}
      title={title}
      subtitle={subtitle}
      userName="Employee User"
      userRole="Employee"
    >
      {renderContent()}
    </DashboardLayout>
  );
}
