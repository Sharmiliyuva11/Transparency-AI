import { useState, useEffect } from "react";
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

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  Food: <FaUtensils />,
  Travel: <FaPlane />,
  Utilities: <FiPackage />,
  Entertainment: <FiCoffee />,
  Miscellaneous: <FiDollarSign />,
  Pharmacy: <FiPackage />,
  Telecommunications: <FiTrendingUp />,
  Healthcare: <FiPackage />,
  Technology: <FiTrendingUp />,
  Education: <FiPackage />,
  Finance: <FiDollarSign />,
  Retail: <FiPackage />,
  Services: <FiTrendingUp />
};

const CATEGORY_COLORS: Record<string, string> = {
  Travel: "#3ba8ff",
  Food: "#38d788",
  Lodging: "#ffa94d",
  Transportation: "#ff6b9d",
  Entertainment: "#c084fc",
  Utilities: "#51cf66",
  "Office Supplies": "#a78bfa",
  Miscellaneous: "#f472b6",
  Pharmacy: "#ff6b35",
  Telecommunications: "#8b5cf6",
  Healthcare: "#06b6d4",
  Technology: "#10b981",
  Education: "#f59e0b",
  Finance: "#ef4444",
  Retail: "#ec4899",
  Services: "#6366f1"
};

// const lineChartData = [
//   { month: "Jul", Food: 10500, Utilities: 2600, Office: 1800, Travel: 3200 },
//   { month: "Aug", Food: 10800, Utilities: 2700, Office: 1900, Travel: 3300 },
//   { month: "Sep", Food: 11000, Utilities: 2750, Office: 2000, Travel: 3400 },
//   { month: "Oct", Food: 11200, Utilities: 2800, Office: 2100, Travel: 3450 }
// ];

const statusBadges: Record<string, string> = {
  Approved: "badge green",
  Flagged: "badge red",
  Pending: "badge yellow"
};

export default function ExpenseCategories() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [detailedExpenses, setDetailedExpenses] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchCategoryData();
    fetchMonthlyTrends();
  }, []);

  const fetchCategoryData = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses/by-category`);
      const data = await res.json();

      if (data.success && data.by_category) {
        const categories = Object.entries(data.by_category).map(([name, catData]: [string, any]) => ({
          name,
          amount: catData.total,
          icon: CATEGORY_ICONS[name] || <FiDollarSign />,
          color: CATEGORY_COLORS[name] || "#999999",
          bgColor: `${CATEGORY_COLORS[name] || "#999999"}26`
        }));

        setCategoryData(categories);

        const barData = categories.map((cat) => ({
          category: cat.name,
          value: cat.amount
        }));

        setBarChartData(barData);

        const allExpenses: any[] = [];
        Object.entries(data.by_category).forEach(([_, catData]: [string, any]) => {
          allExpenses.push(...(catData.expenses || []));
        });

        const detailedList = allExpenses
          .slice(0, 5)
          .map((exp: any) => ({
            date: new Date(exp.uploadedAt).toISOString().split('T')[0],
            category: exp.vendor || exp.category,
            amount: `$${exp.total?.toFixed(2) || "0.00"}`,
            status: exp.status === "Processed" ? "Approved" : exp.status
          }));

        setDetailedExpenses(detailedList);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching category data:", err);
      setLoading(false);
    }
  };

  const fetchMonthlyTrends = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses/trends`);
      const data = await res.json();

      if (data.success && data.trends) {
        setLineChartData(data.trends);
      }
    } catch (err) {
      console.error("Error fetching monthly trends:", err);
    }
  };

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
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
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
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
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
                {categoryData.map((category, index) => (
                  <Line
                    key={category.name}
                    type="monotone"
                    dataKey={category.name}
                    stroke={category.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: category.color }}
                    activeDot={{ r: 6 }}
                  />
                ))}
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