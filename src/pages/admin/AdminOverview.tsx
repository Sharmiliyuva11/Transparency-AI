import { useState, useEffect } from "react";
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

const monthlyTrend = [
  { month: "Jul", value: 520 },
  { month: "Aug", value: 640 },
  { month: "Sep", value: 580 },
  { month: "Oct", value: 720 }
];

const CATEGORY_COLORS: Record<string, string> = {
  Travel: "#3ba8ff",
  Food: "#38d788",
  Lodging: "#ffa94d",
  Transportation: "#ff6b9d",
  Entertainment: "#c084fc",
  Utilities: "#51cf66",
  "Office Supplies": "#a78bfa",
  Miscellaneous: "#f472b6"
};

const statBadges: Record<string, string> = {
  Approved: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

export default function AdminOverview() {
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchExpensesData();
  }, []);

  const fetchExpensesData = async () => {
    try {
      const statsRes = await fetch(`${API_URL}/expenses/stats`);
      const statsData = await statsRes.json();

      if (statsData.success) {
        const percentages = statsData.category_percentages;
        const chartData = Object.entries(percentages).map(([category, percentage]: [string, any]) => ({
          name: category,
          value: parseInt(percentage),
          color: CATEGORY_COLORS[category] || "#999999"
        }));
        setSpendingByCategory(chartData);
        setTotalExpenses(statsData.total_amount);
      }

      const expensesRes = await fetch(`${API_URL}/expenses`);
      const expensesData = await expensesRes.json();

      if (expensesData.success && expensesData.expenses) {
        const formattedExpenses = expensesData.expenses
          .slice(0, 5)
          .map((exp: any) => ({
            date: new Date(exp.uploadedAt).toISOString().split('T')[0],
            vendor: exp.vendor || "Unknown",
            amount: `$${exp.total?.toFixed(2) || "0.00"}`,
            category: exp.category,
            status: exp.status === "Processed" ? "Approved" : exp.status
          }));
        setRecentExpenses(formattedExpenses);
        setPendingCount(expensesData.expenses.filter((e: any) => e.status === "Needs Review").length);
        setFlaggedCount(expensesData.expenses.filter((e: any) => e.status === "Flagged").length);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid cols-4">
        <div className="stat-card">
          <div className="stat-label">My Total Expenses</div>
          <div className="stat-value">${totalExpenses.toFixed(0)}</div>
          <div className="stat-label">Total amount</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Receipts Uploaded</div>
          <div className="stat-value">{recentExpenses.length}</div>
          <div className="stat-label">Total submissions</div>
        </div>
        <div className="stat-card accent-yellow">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Awaiting approval</div>
        </div>
        <div className="stat-card accent-red">
          <div className="stat-label">Flagged Items</div>
          <div className="stat-value">{flaggedCount}</div>
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
    </>
  );
}