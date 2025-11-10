import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { FiCoffee, FiDollarSign, FiPackage, FiTrendingUp } from "react-icons/fi";
import { FaPlane, FaUtensils } from "react-icons/fa";

// Mock data for category cards
const categoryData = [
  { 
    name: "Food", 
    amount: 11200, 
    icon: <FaUtensils />, 
    color: "#3ba8ff",
    bgColor: "rgba(59, 168, 255, 0.15)"
  },
  { 
    name: "Travel", 
    amount: 3450, 
    icon: <FaPlane />, 
    color: "#38d788",
    bgColor: "rgba(56, 215, 136, 0.15)"
  },
  { 
    name: "Utilities", 
    amount: 2800, 
    icon: <FiPackage />, 
    color: "#ffa94d",
    bgColor: "rgba(255, 169, 77, 0.15)"
  },
  { 
    name: "Entertainment", 
    amount: 1950, 
    icon: <FiCoffee />, 
    color: "#ff6b9d",
    bgColor: "rgba(255, 107, 157, 0.15)"
  },
  { 
    name: "Miscellaneous", 
    amount: 2100, 
    icon: <FiDollarSign />, 
    color: "#c084fc",
    bgColor: "rgba(192, 132, 252, 0.15)"
  }
];

// Mock data for bar chart
const barChartData = [
  { category: "Food", value: 11200 },
  { category: "Travel", value: 3450 },
  { category: "Utilities", value: 2800 },
  { category: "Entertainment", value: 1950 },
  { category: "Misc", value: 2100 }
];

// Mock data for line chart
const lineChartData = [
  { month: "Jul", Food: 10500, Utilities: 2600, Office: 1800, Travel: 3200 },
  { month: "Aug", Food: 10800, Utilities: 2700, Office: 1900, Travel: 3300 },
  { month: "Sep", Food: 11000, Utilities: 2750, Office: 2000, Travel: 3400 },
  { month: "Oct", Food: 11200, Utilities: 2800, Office: 2100, Travel: 3450 }
];

// Mock data for detailed table
const detailedExpenses = [
  { date: "2025-11-01", category: "Global Airlines", amount: "$2,000", status: "Flagged" },
  { date: "2025-10-30", category: "ABC Tax Service", amount: "$1,450", status: "Flagged" },
  { date: "2025-10-28", category: "Office Supplies", amount: "$850", status: "Approved" },
  { date: "2025-10-25", category: "Travel Cab Co.", amount: "$1,085", status: "Approved" },
  { date: "2025-10-22", category: "Food", amount: "$600", status: "Approved" }
];

const statusBadges: Record<string, string> = {
  Approved: "badge green",
  Flagged: "badge red",
  Pending: "badge yellow"
};

export default function ExpenseCategories() {
  return (
    <>
      {/* Header */}
      <div className="section-card" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
          Expense Categories
        </h2>
        <p className="dashboard-subtitle">
          Detailed expense breakdown across different categories
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid cols-5" style={{ marginBottom: "24px" }}>
        {categoryData.map((category) => (
          <div 
            key={category.name} 
            className="stat-card"
            style={{
              background: category.bgColor,
              border: `1px solid ${category.color}40`,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ 
              position: "absolute", 
              top: "16px", 
              right: "16px",
              fontSize: "32px",
              color: category.color,
              opacity: 0.3
            }}>
              {category.icon}
            </div>
            <div className="stat-label" style={{ color: category.color }}>
              {category.name}
            </div>
            <div className="stat-value" style={{ fontSize: "32px", marginTop: "8px" }}>
              ${category.amount.toLocaleString()}
            </div>
            <div className="stat-label" style={{ marginTop: "4px" }}>
              Total spent
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid cols-1" style={{ marginBottom: "24px" }}>
        {/* Bar Chart */}
        <div className="section-card">
          <div className="section-header">
            <h3>Category-wise Spending Distribution</h3>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barChartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(99, 125, 190, 0.15)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="category" 
                  stroke="#5870a5" 
                  dy={6} 
                  tickLine={false} 
                  axisLine={false}
                  style={{ fontSize: "13px" }}
                />
                <YAxis 
                  stroke="#5870a5" 
                  tickLine={false} 
                  axisLine={false}
                  style={{ fontSize: "13px" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 168, 255, 0.08)" }}
                  contentStyle={{ 
                    background: "#0c1736", 
                    borderRadius: 12, 
                    border: "1px solid rgba(71, 102, 190, 0.45)" 
                  }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={categoryData[index]?.color || "#3ba8ff"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="grid cols-1" style={{ marginBottom: "24px" }}>
        <div className="section-card">
          <div className="section-header">
            <h3>Category Comparison Over Time</h3>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={lineChartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(99, 125, 190, 0.15)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="month" 
                  stroke="#5870a5" 
                  dy={6} 
                  tickLine={false} 
                  axisLine={false}
                  style={{ fontSize: "13px" }}
                />
                <YAxis 
                  stroke="#5870a5" 
                  tickLine={false} 
                  axisLine={false}
                  style={{ fontSize: "13px" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ stroke: "#3ba8ff", strokeWidth: 1 }}
                  contentStyle={{ 
                    background: "#0c1736", 
                    borderRadius: 12, 
                    border: "1px solid rgba(71, 102, 190, 0.45)" 
                  }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: "#99a5cc", fontSize: "13px" }}>{value}</span>
                  )}
                />
                <Line 
                  type="monotone" 
                  dataKey="Food" 
                  stroke="#3ba8ff" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: "#3ba8ff" }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Utilities" 
                  stroke="#ffa94d" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: "#ffa94d" }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Office" 
                  stroke="#ff6b9d" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: "#ff6b9d" }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Travel" 
                  stroke="#38d788" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: "#38d788" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="section-card">
        <div className="section-header">
          <h3>Detailed Category Expenses</h3>
          <a className="secondary-link" href="#">
            View All
          </a>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {detailedExpenses.map((expense, index) => (
              <tr key={index}>
                <td>{expense.date}</td>
                <td>{expense.category}</td>
                <td>{expense.amount}</td>
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