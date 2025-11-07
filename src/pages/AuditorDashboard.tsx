import DashboardLayout from "../components/DashboardLayout";
import {
  FiActivity,
  FiArchive,
  FiBarChart2,
  FiBookOpen,
  FiFileText,
  FiGrid,
  FiLayers,
  FiShield,
  FiTrendingUp
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa6";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const complianceData = [
  { name: "Compliant", value: 91, color: "#38d788" },
  { name: "Warning", value: 7, color: "#ffa94d" },
  { name: "Violation", value: 2, color: "#ff6b6b" }
];

const reviewStats = [
  { month: "Jul", verified: 58, flagged: 6 },
  { month: "Aug", verified: 54, flagged: 4 },
  { month: "Sep", verified: 52, flagged: 5 },
  { month: "Oct", verified: 57, flagged: 3 }
];

const transactions = [
  { date: "2025-11-01", user: "User 1", vendor: "Tech Solutions Inc", amount: "$2,450", category: "IT", status: "Verified", aiFlag: "Clean" },
  { date: "2025-10-30", user: "User 2", vendor: "Office Depot", amount: "$340", category: "Office", status: "Verified", aiFlag: "Clean" },
  { date: "2025-10-28", user: "User 3", vendor: "Global Airlines", amount: "$1,800", category: "Travel", status: "Flagged", aiFlag: "Flagged" },
  { date: "2025-10-25", user: "User 4", vendor: "Restaurant Place", amount: "$450", category: "Food", status: "Pending", aiFlag: "Clean" },
  { date: "2025-10-22", user: "User 5", vendor: "Cloud Services Ltd", amount: "$1,200", category: "IT", status: "Verified", aiFlag: "Clean" },
  { date: "2025-10-21", user: "User 6", vendor: "ABC Taxi Service", amount: "$250", category: "Travel", status: "Flagged", aiFlag: "Flagged" },
  { date: "2025-10-18", user: "User 7", vendor: "Stationery World", amount: "$180", category: "Office", status: "Verified", aiFlag: "Clean" },
  { date: "2025-10-15", user: "User 8", vendor: "Conference Center", amount: "$5,600", category: "Misc", status: "Pending", aiFlag: "Clean" }
];

const auditTrail = [
  { title: "John Smith", action: "Approved Reports", detail: "Tech Solutions Inc - $2,450", timestamp: "2025-10-15 14:32 - 192.168.1.100" },
  { title: "Sarah Johnson", action: "Uploaded Receipt", detail: "Office Depot - $340", timestamp: "2025-10-15 13:48 - 192.168.1.202" },
  { title: "John Smith", action: "Flagged as Duplicate", detail: "Global Airlines - $1,800", timestamp: "2025-10-14 19:05 - 192.168.1.100" }
];

const statusBadges: Record<string, string> = {
  Verified: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

const flagBadges: Record<string, string> = {
  Clean: "badge green",
  Flagged: "badge red"
};

export default function AuditorDashboard() {
  return (
    <DashboardLayout
      appName="AI Expense Transparency"
      sidebarLinks={[
        { label: "Dashboard Overview", icon: <FiGrid />, path: "/dashboard/auditor" },
        { label: "All Expenses", icon: <FiArchive /> },
        { label: "Anomaly Review", icon: <FiActivity /> },
        { label: "Reports", icon: <FiBarChart2 /> },
        { label: "Audit Trail", icon: <FiLayers /> },
        { label: "AI Insights", icon: <FaRobot /> },
        { label: "AI Assistant", icon: <FiBookOpen /> },
        { label: "Settings", icon: <FiShield /> }
      ]}
      footerLinks={[{ label: "Trends", icon: <FiTrendingUp /> }]}
      title="Auditor Dashboard"
      subtitle="Comprehensive oversight and compliance verification"
      userName="Admin User"
      userRole="Auditor"
    >
      <div className="grid cols-4">
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">172</div>
          <div className="stat-label">This audit period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Compliance Rate</div>
          <div className="stat-value">90.7%</div>
          <div className="stat-label">+2.1% improvement</div>
        </div>
        <div className="stat-card accent-green">
          <div className="stat-label">AI Flags Reviewed</div>
          <div className="stat-value">16</div>
          <div className="stat-label">Anomalies verified</div>
        </div>
        <div className="stat-card accent-red">
          <div className="stat-label">Policy Violations</div>
          <div className="stat-value">4</div>
          <div className="stat-label">Require attention</div>
        </div>
      </div>
      <div className="grid cols-2">
        <div className="section-card">
          <div className="section-header">
            <h3>Compliance Overview</h3>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={complianceData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={4}>
                  {complianceData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0c1736", borderRadius: 12, border: "1px solid rgba(71,102,190,0.45)" }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid cols-3">
            {complianceData.map((item) => (
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
            <h3>Admin Review Statistics</h3>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={reviewStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2a4d" />
                <XAxis dataKey="month" stroke="#5870a5" />
                <YAxis stroke="#5870a5" />
                <Tooltip
                  contentStyle={{ background: "#0c1736", borderRadius: 12, border: "1px solid rgba(71,102,190,0.45)" }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                />
                <Bar dataKey="verified" fill="#38d788" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="flagged" fill="#ff6b6b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="section-card">
        <div className="section-header">
          <h3>All Transactions (Read-only Access)</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Status</th>
              <th>AI Flag</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.vendor + txn.date}>
                <td>{txn.date}</td>
                <td>{txn.user}</td>
                <td>{txn.vendor}</td>
                <td>{txn.amount}</td>
                <td>
                  <span className="badge blue">{txn.category}</span>
                </td>
                <td>
                  <span className={statusBadges[txn.status]}>{txn.status}</span>
                </td>
                <td>
                  <span className={flagBadges[txn.aiFlag]}>{txn.aiFlag}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-card">
        <div className="section-header">
          <h3>Recent Audit Trail Activity</h3>
        </div>
        <div className="audit-feed">
          {auditTrail.map((entry) => (
            <div key={entry.timestamp} className="audit-item">
              <strong>{entry.title}</strong>
              <span>{entry.action}</span>
              <span>{entry.detail}</span>
              <span>{entry.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
