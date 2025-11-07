import DashboardLayout from "../components/DashboardLayout";
import {
  FiActivity,
  FiCamera,
  FiCloudLightning,
  FiUploadCloud,
  FiFileText,
  FiFolder,
  FiHome,
  FiLayers,
  FiSettings,
  FiTrendingUp
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa6";

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

export default function EmployeeDashboard() {
  return (
    <DashboardLayout
      appName="AI Expense Transparency"
      sidebarLinks={[
        { label: "Dashboard Overview", icon: <FiHome />, path: "/dashboard/employee" },
        { label: "Upload Receipt", icon: <FiCloudUpload /> },
        { label: "My Expenses", icon: <FiFolder /> },
        { label: "AI Assistant", icon: <FaRobot /> },
        { label: "Settings", icon: <FiSettings /> }
      ]}
      footerLinks={[{ label: "Reports", icon: <FiFileText /> }]}
      title="Upload Expense Document"
      subtitle="AI powered OCR will extract data automatically"
      userName="Employee User"
      userRole="Employee"
    >
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
      <div className="grid cols-3">
        <div className="stat-card">
          <div className="stat-label">Receipts this month</div>
          <div className="stat-value">12</div>
          <div className="stat-label">4 awaiting review</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Policy Compliance</div>
          <div className="stat-value">96%</div>
          <div className="stat-label">+4% vs last month</div>
        </div>
        <div className="stat-card accent-yellow">
          <div className="stat-label">AI Suggestions</div>
          <div className="stat-value">3</div>
          <div className="stat-label">Pending actions</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
