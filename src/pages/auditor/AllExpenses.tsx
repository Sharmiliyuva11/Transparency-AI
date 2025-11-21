import { useState, useEffect } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CategorySpending {
  category: string;
  amount: number;
  change: string;
}

interface SpendingItem {
  category: string;
  value: number;
}

interface CategoryExpense {
  date: string;
  vendor: string;
  amount: number;
  status: "Flagged" | "Verified" | "Pending";
}

interface TrendData {
  month: string;
  [key: string]: string | number;
}

const statusBadges: Record<string, string> = {
  Verified: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

const categoryColors: Record<string, string> = {
  Travel: "#3ba8ff",
  Food: "#38d788",
  Office: "#ffa94d",
  IT: "#ff6b6b",
  Misc: "#a78bfa",
  Other: "#a78bfa"
};

export default function AllExpenses() {
  const [activeTab, setActiveTab] = useState<string>("Travel");
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [spendingDistribution, setSpendingDistribution] = useState<SpendingItem[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<TrendData[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<Record<string, CategoryExpense[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/auditor/expenses");
        const data = await response.json();

        if (data.success) {
          setCategorySpending(data.categorySpending || []);
          setSpendingDistribution(data.spendingDistribution || []);
          setCategoryTrends(data.categoryTrends || []);
          setCategoryExpenses(data.categoryExpenses || {});

          const categories = data.categorySpending?.map((c: CategorySpending) => c.category) || [];
          if (categories.length > 0) {
            setActiveTab(categories[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching expense data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, []);

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <h2 className="dashboard-title">AI Expenses</h2>
        <p className="dashboard-subtitle">Analyze spending patterns across different categories</p>
      </div>

      {/* Category Spending Cards */}
      <div className="grid cols-5">
        {categorySpending.map((item) => (
          <div key={item.category} className="stat-card" style={{ borderTop: `3px solid ${categoryColors[item.category] || "#a78bfa"}` }}>
            <div className="stat-label">{item.category}</div>
            <div className="stat-value">${item.amount.toLocaleString()}</div>
            <div className="stat-label">{item.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid cols-2">
        {/* Category-wise Spending Distribution */}
        <div className="section-card">
          <div className="section-header">
            <h3>Category-wise Spending Distribution</h3>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={spendingDistribution} layout="vertical">
                <XAxis type="number" stroke="#5870a5" />
                <YAxis type="category" dataKey="category" stroke="#5870a5" width={60} />
                <Tooltip
                  contentStyle={{
                    background: "#0c1736",
                    borderRadius: 12,
                    border: "1px solid rgba(71,102,190,0.45)"
                  }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                />
                <Bar dataKey="value" fill="#3ba8ff" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Comparison Over Time */}
        <div className="section-card">
          <div className="section-header">
            <h3>Category Comparison Over Time</h3>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={categoryTrends}>
                <XAxis dataKey="month" stroke="#5870a5" />
                <YAxis stroke="#5870a5" />
                <Tooltip
                  contentStyle={{
                    background: "#0c1736",
                    borderRadius: 12,
                    border: "1px solid rgba(71,102,190,0.45)"
                  }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                />
                <Line
                  type="monotone"
                  dataKey="Food"
                  stroke={categoryColors.Food}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="IT"
                  stroke={categoryColors.IT}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Misc"
                  stroke={categoryColors.Misc}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Office"
                  stroke={categoryColors.Office}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Travel"
                  stroke={categoryColors.Travel}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "2px",
                    background: color
                  }}
                />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Category Expenses */}
      <div className="section-card">
        <div className="section-header">
          <h3>Detailed Category Expenses</h3>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid var(--border-soft)" }}>
          {Object.keys(categoryExpenses).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              style={{
                padding: "12px 24px",
                background: activeTab === category ? "var(--surface-sidebar-active)" : "transparent",
                border: "none",
                borderBottom: activeTab === category ? `2px solid ${categoryColors[category] || "#a78bfa"}` : "2px solid transparent",
                color: activeTab === category ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === category ? 600 : 400,
                transition: "all 0.2s"
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Expense Table */}
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {categoryExpenses[activeTab]?.map((expense, index) => (
              <tr key={`${expense.vendor}-${index}`}>
                <td>{expense.date}</td>
                <td>{expense.vendor}</td>
                <td>${expense.amount.toLocaleString()}</td>
                <td>
                  <span className={statusBadges[expense.status]}>{expense.status}</span>
                </td>
              </tr>
            )) || (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "24px" }}>
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}