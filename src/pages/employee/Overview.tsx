import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

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

const statusBadges: Record<string, string> = {
  Approved: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

export default function Overview() {
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
            {recentExpenses.map((expense) => (
              <tr key={expense.vendor + expense.date}>
                <td>{expense.date}</td>
                <td>{expense.vendor}</td>
                <td>{expense.amount}</td>
                <td>
                  <span className="badge blue">{expense.category}</span>
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
