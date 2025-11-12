import { useState } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Category spending data
const categorySpending = [
  { category: "Travel", amount: 15200, change: "+1.6% vs last month", color: "#3ba8ff" },
  { category: "Food", amount: 3400, change: "+1.6% vs last month", color: "#38d788" },
  { category: "Office", amount: 5800, change: "+1.6% vs last month", color: "#ffa94d" },
  { category: "IT", amount: 8900, change: "+1.6% vs last month", color: "#ff6b6b" },
  { category: "Misc", amount: 6700, change: "+1.6% vs last month", color: "#a78bfa" }
];

// Category-wise spending distribution (horizontal bar chart)
const spendingDistribution = [
  { category: "Misc", value: 1.8 },
  { category: "IT", value: 2.4 },
  { category: "Office", value: 1.6 },
  { category: "Food", value: 0.9 },
  { category: "Travel", value: 4.2 }
];

// Category comparison over time
const categoryTrends = [
  { month: "Jul", Food: 3200, IT: 8500, Misc: 6400, Office: 5600, Travel: 14800 },
  { month: "Aug", Food: 3300, IT: 8700, Misc: 6500, Office: 5700, Travel: 15000 },
  { month: "Sep", Food: 3350, IT: 8800, Misc: 6600, Office: 5750, Travel: 15100 },
  { month: "Oct", Food: 3400, IT: 8900, Misc: 6700, Office: 5800, Travel: 15200 }
];

// Detailed expenses by category
const travelExpenses = [
  { date: "2025-11-01", vendor: "Global Airlines", amount: 8000, status: "Flagged" as const },
  { date: "2025-10-30", vendor: "ABC Taxi Service", amount: 2500, status: "Flagged" as const },
  { date: "2025-10-25", vendor: "Hotel International", amount: 1200, status: "Verified" as const },
  { date: "2025-10-20", vendor: "Rental Car XYZ", amount: 600, status: "Verified" as const }
];

const foodExpenses = [
  { date: "2025-11-01", vendor: "Tech Solutions Inc", amount: 2450, status: "Verified" as const },
  { date: "2025-10-28", vendor: "Office Depot", amount: 340, status: "Verified" as const },
  { date: "2025-10-22", vendor: "Global Airlines", amount: 1800, status: "Flagged" as const },
  { date: "2025-10-18", vendor: "Restaurant Place", amount: 450, status: "Pending" as const }
];

const officeExpenses = [
  { date: "2025-11-01", vendor: "Tech Solutions Inc", amount: 2450, status: "Verified" as const },
  { date: "2025-10-28", vendor: "Office Depot", amount: 340, status: "Verified" as const },
  { date: "2025-10-22", vendor: "Global Airlines", amount: 1800, status: "Flagged" as const },
  { date: "2025-10-18", vendor: "Restaurant Place", amount: 450, status: "Pending" as const }
];

const itExpenses = [
  { date: "2025-11-01", vendor: "Tech Solutions Inc", amount: 2450, status: "Verified" as const },
  { date: "2025-10-28", vendor: "Office Depot", amount: 340, status: "Verified" as const },
  { date: "2025-10-22", vendor: "Global Airlines", amount: 1800, status: "Flagged" as const },
  { date: "2025-10-18", vendor: "Restaurant Place", amount: 450, status: "Pending" as const }
];

const miscExpenses = [
  { date: "2025-11-01", vendor: "Tech Solutions Inc", amount: 2450, status: "Verified" as const },
  { date: "2025-10-28", vendor: "Office Depot", amount: 340, status: "Verified" as const },
  { date: "2025-10-22", vendor: "Global Airlines", amount: 1800, status: "Flagged" as const },
  { date: "2025-10-18", vendor: "Restaurant Place", amount: 450, status: "Pending" as const }
];

const categoryExpensesMap = {
  Travel: travelExpenses,
  Food: foodExpenses,
  Office: officeExpenses,
  IT: itExpenses,
  Misc: miscExpenses
};

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
  Misc: "#a78bfa"
};

export default function AllExpenses() {
  const [activeTab, setActiveTab] = useState<keyof typeof categoryExpensesMap>("Travel");

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <h2 className="dashboard-title">AI Expenses</h2>
        <p className="dashboard-subtitle">Analyze spending patterns across different categories</p>
      </div>

      {/* Category Spending Cards */}
      <div className="grid cols-5">
        {categorySpending.map((item) => (
          <div key={item.category} className="stat-card" style={{ borderTop: `3px solid ${item.color}` }}>
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
          {Object.keys(categoryExpensesMap).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category as keyof typeof categoryExpensesMap)}
              style={{
                padding: "12px 24px",
                background: activeTab === category ? "var(--surface-sidebar-active)" : "transparent",
                border: "none",
                borderBottom: activeTab === category ? `2px solid ${categoryColors[category]}` : "2px solid transparent",
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
            {categoryExpensesMap[activeTab].map((expense, index) => (
              <tr key={`${expense.vendor}-${index}`}>
                <td>{expense.date}</td>
                <td>{expense.vendor}</td>
                <td>${expense.amount.toLocaleString()}</td>
                <td>
                  <span className={statusBadges[expense.status]}>{expense.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}