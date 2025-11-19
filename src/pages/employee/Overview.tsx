import { useState, useEffect } from "react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useExpenseRefresh } from "../../context/ExpenseContext";

const monthlyTrend = [
  { month: "Jul", value: 420 },
  { month: "Aug", value: 380 },
  { month: "Sep", value: 450 },
  { month: "Oct", value: 520 }
];

const statusBadges: Record<string, string> = {
  Approved: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

interface Expense {
  id: number;
  file: string;
  uploadedAt: string;
  category: string;
  vendor: string;
  total: number;
  textPreview: string;
  status: string;
  confidence?: number;
}

export default function Overview() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [spendingByCategory, setSpendingByCategory] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalExpenses: 0,
    byCategory: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useExpenseRefresh();

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();
      if (data.success) {
        const expensesList = data.expenses || [];
        setExpenses(expensesList);
        calculateStats(expensesList);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (expensesList: Expense[]) => {
    const totalAmount = expensesList.reduce((sum, e) => sum + (e.total || 0), 0);
    const byCategory: Record<string, number> = {};
    const colors: Record<string, string> = {
      "Travel": "#3ba8ff",
      "Food": "#38d788",
      "Office": "#ffa94d",
      "IT": "#ff7b7b",
      "Other": "#a78bfa"
    };

    expensesList.forEach(expense => {
      const cat = expense.category || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + (expense.total || 0);
    });

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value: Math.round((value / totalAmount) * 100) || 0,
      color: colors[name] || "#a78bfa"
    }));

    setStats({
      totalAmount,
      totalExpenses: expensesList.length,
      byCategory
    });
    setSpendingByCategory(categoryData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  return (
    <>
      <div className="grid cols-4">
        <div className="stat-card">
          <div className="stat-label">My Total Expenses</div>
          <div className="stat-value">{formatCurrency(stats.totalAmount)}</div>
          <div className="stat-label">Total submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Receipts Uploaded</div>
          <div className="stat-value">{stats.totalExpenses}</div>
          <div className="stat-label">Total submissions</div>
        </div>
        <div className="stat-card accent-yellow">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">{expenses.filter(e => e.status === "Needs Review").length}</div>
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
                  contentStyle={{ background: "var(--surface-card)", borderRadius: 12, border: "1px solid var(--border-strong)" }}
                  labelStyle={{ color: "var(--text-secondary)" }}
                  itemStyle={{ color: "var(--text-primary)" }}
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
            {expenses.length > 0 ? (
              expenses.slice(0, 5).map((expense) => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.uploadedAt)}</td>
                  <td>{expense.vendor || "N/A"}</td>
                  <td>{formatCurrency(expense.total || 0)}</td>
                  <td>
                    <span className="badge blue">{expense.category || "Other"}</span>
                  </td>
                  <td>
                    <span className={statusBadges[expense.status] ?? "badge yellow"}>{expense.status}</span>
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
                <td colSpan={6} style={{ textAlign: "center", color: "#999" }}>
                  No expenses uploaded yet
                </td>
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
    </>
  );
}
