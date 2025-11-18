import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiFolder,
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
import { apiService, Expense, ExpenseStats } from "../services/api";

const statBadges: Record<string, string> = {
  Approved: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

export default function AdminDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [expensesData, statsData] = await Promise.all([
          apiService.getExpenses(),
          apiService.getExpenseStats()
        ]);

        if (expensesData.success) {
          setExpenses(expensesData.expenses);
        }
        if (statsData.success) {
          setStats(statsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for charts
  const spendingByCategory = stats ? Object.entries(stats.category_percentages).map(([name, value], index) => {
    const colors = ["#3ba8ff", "#38d788", "#ffa94d", "#ff6b6b", "#a855f7"];
    return { name, value, color: colors[index % colors.length] };
  }) : [];

  const monthlyTrend = [
    { month: "Jul", value: 520 },
    { month: "Aug", value: 640 },
    { month: "Sep", value: 580 },
    { month: "Oct", value: 720 }
  ];

  return (
    <DashboardLayout
      appName="AI Expense Transparency"
      sidebarLinks={[
        { label: "Dashboard Overview", icon: <FiGrid />, path: "/dashboard/admin" },
        { label: "Upload Receipt", icon: <FiUploadCloud /> },
        { label: "My Expenses", icon: <FiFolder /> },
        { label: "AI Assistant", icon: <FaRobot />, path: "/dashboard/admin/assistant" },
        { label: "Settings", icon: <FiSettings /> },
        { label: "Expense Categories", icon: <FiPieChart /> },
        { label: "Anomaly Detection", icon: <FiActivity /> },
        { label: "Reports", icon: <FiBarChart2 /> },
        { label: "User Management", icon: <FiUserCheck /> },
        { label: "AI Insights", icon: <FiBookOpen /> }
      ]}
      footerLinks={[{ label: "Support", icon: <FiList /> }]}
      title="My Expense Dashboard"
      subtitle="Track and manage your personal expenses"
      userName="Admin User"
      userRole="Admin"
    >
      <div className="grid cols-4">
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">
            {loading ? '...' : stats ? `$${stats.total_amount.toFixed(2)}` : '$0.00'}
          </div>
          <div className="stat-label">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Receipts Uploaded</div>
          <div className="stat-value">
            {loading ? '...' : stats ? stats.total_expenses : 0}
          </div>
          <div className="stat-label">Total submissions</div>
        </div>
        <div className="stat-card accent-yellow">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">
            {loading ? '...' : expenses.filter(e => e.status === 'Needs Review').length}
          </div>
          <div className="stat-label">Awaiting approval</div>
        </div>
        <div className="stat-card accent-red">
          <div className="stat-label">Flagged Items</div>
          <div className="stat-value">
            {loading ? '...' : expenses.filter(e => e.status === 'Flagged').length}
          </div>
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
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">Loading...</td>
              </tr>
            ) : expenses.length > 0 ? (
              expenses.slice(0, 5).map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.uploadedAt).toLocaleDateString()}</td>
                  <td>{expense.vendor || 'Unknown Vendor'}</td>
                  <td>${expense.total.toFixed(2)}</td>
                  <td>
                    <span className="badge blue">{expense.category}</span>
                  </td>
                  <td>
                    <span className={statBadges[expense.status] || 'badge gray'}>{expense.status}</span>
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
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">No expenses found</td>
              </tr>
            )}
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
