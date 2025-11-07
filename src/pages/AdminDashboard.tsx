import DashboardLayout from "../components/DashboardLayout";
import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiGrid,
  FiList,
  FiPieChart,
  FiSettings,
  FiUploadCloud,
  FiUserCheck
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

const spendingByCategory = [
  { name: "Travel", value: 62, color: "#3ba8ff" },
  { name: "Food", value: 14, color: "#38d788" },
  { name: "Office", value: 24, color: "#ffa94d" }
];

const monthlyTrend = [
  { month: "Jul", value: 520 },
  { month: "Aug", value: 640 },
  { month: "Sep", value: 580 },
  { month: "Oct", value: 720 }
];

const recentExpenses = [
  { date: "2025-11-01", vendor: "Coffee Shop", amount: "$45", category: "Food", status: "Approved" },
  { date: "2025-10-30", vendor: "Uber", amount: "$28", category: "Travel", status: "Approved" },
  { date: "2025-10-28", vendor: "Office Depot", amount: "$120", category: "Office", status: "Pending" },
  { date: "2025-10-25", vendor: "Hotel XYZ", amount: "$450", category: "Travel", status: "Flagged" },
  { date: "2025-10-22", vendor: "Restaurant", amount: "$85", category: "Food", status: "Approved" }
];

const statBadges: Record<string, string> = {
  Approved: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

export default function AdminDashboard() {
  return (
    <DashboardLayout
      appName="AI Expense Transparency"
      sidebarLinks={[
        { label: "Dashboard Overview", icon: <FiGrid />, path: "/dashboard/admin" },
        { label: "Upload Receipt", icon: <FiUploadCloud /> },
        { label: "Expense Categories", icon: <FiPieChart /> },
        { label: "Anomaly Detection", icon: <FiActivity /> },
        { label: "Reports", icon: <FiBarChart2 /> },
        { label: "User Management", icon: <FiUserCheck /> },
        { label: "AI Insights", icon: <FaRobot /> },
        { label: "Assistant", icon: <FiBookOpen /> },
        { label: "Settings", icon: <FiSettings /> }
      ]}
      footerLinks={[{ label: "Support", icon: <FiList /> }]}
      title="My Expense Dashboard"
      subtitle="Track and manage your personal expenses"
      userName="Admin User"
      userRole="Admin"
    >
      <div className="grid cols-4">
        <div className="stat-card">
          <div className="stat-label">My Total Expenses</div>
          <div className="stat-value">$728</div>
          <div className="stat-label">This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Receipts Uploaded</div>
          <div className="stat-value">5</div>
          <div className="stat-label">Total submissions</div>
        </div>
        <div className="stat-card accent-yellow">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">1</div>
          <div className="stat-label">Awaiting approval</div>
        </div>
        <div className="stat-card accent-red">
          <div className="stat-label">Flagged Items</div>
          <div className="stat-value">1</div>
          <div className="stat-label">Needs attention</div>
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
                  <span className={statBadges[expense.status]}>{expense.status}</span>
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
    </DashboardLayout>
  );
}
