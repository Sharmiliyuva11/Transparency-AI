import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportsProps, AIInsight } from "./reportsMockData";
import { mockReportsProps } from "./reportsMockData";
import { formatCurrency, formatPercentage, formatCompactCurrency } from "./reportsUtils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  accentClass?: string;
}

function MetricCard({ label, value, subtitle, accentClass }: MetricCardProps) {
  return (
    <div className={`stat-card ${accentClass || ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{subtitle}</div>
    </div>
  );
}

interface AIInsightCardProps {
  insight: AIInsight;
}

function AIInsightCard({ insight }: AIInsightCardProps) {
  const severityColors: Record<string, string> = {
    Info: "#3ba8ff",
    Alert: "#ff6b6b",
    Success: "#38d788",
    Warning: "#ffa94d"
  };

  const severityBgColors: Record<string, string> = {
    Info: "var(--badge-blue-bg)",
    Alert: "var(--badge-red-bg)",
    Success: "var(--badge-green-bg)",
    Warning: "var(--badge-yellow-bg)"
  };

  const severityIcons: Record<string, string> = {
    Info: "ℹ️",
    Alert: "⚠️",
    Success: "✓",
    Warning: "⚡"
  };

  return (
    <div
      className="section-card"
      style={{
        borderColor: severityColors[insight.severity],
        borderWidth: "1px",
        borderStyle: "solid"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: severityBgColors[insight.severity],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            flexShrink: 0
          }}
        >
          {severityIcons[insight.severity]}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>
            {insight.type}
          </h4>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const data: ReportsProps = mockReportsProps;

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <h2 className="dashboard-title">Expense Reports and Insights</h2>
        <p className="dashboard-subtitle">Comprehensive analytics for tracking, spending, and anomalies</p>
      </div>

      <div className="grid cols-2">
        <div className="section-card">
          <div className="section-header">
            <h3>Expense Trend Over Time</h3>
            <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
              <span className="badge blue">Last 6 Months</span>
              <span className="badge blue">All Departments</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={data.expenseTrendData}>
                <XAxis
                  dataKey="month"
                  stroke="#5870a5"
                  dy={6}
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#5870a5"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <Tooltip
                  cursor={{ stroke: "#3ba8ff", strokeWidth: 1 }}
                  contentStyle={{
                    background: "#0c1736",
                    borderRadius: 12,
                    border: "1px solid rgba(71,102,190,0.45)"
                  }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3ba8ff"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#3ba8ff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h3>Category-Wise Spending</h3>
            <span className="badge blue">All Categories</span>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data.categorySpendingData} layout="horizontal">
                <XAxis
                  type="number"
                  stroke="#5870a5"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="#5870a5"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: "12px" }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 168, 255, 0.1)" }}
                  contentStyle={{
                    background: "#0c1736",
                    borderRadius: 12,
                    border: "1px solid rgba(71,102,190,0.45)"
                  }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="amount" fill="#ff6b6b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid cols-4">
        <MetricCard
          label="Total Expenses"
          value={formatCompactCurrency(data.totalExpenses)}
          subtitle="This quarter"
        />
        <MetricCard
          label="Compliance Rate"
          value={formatPercentage(data.complianceRate)}
          subtitle="Success rate"
          accentClass="accent-green"
        />
        <MetricCard
          label="Average per Transaction"
          value={formatCurrency(data.averagePerTransaction)}
          subtitle="Per expense"
        />
        <MetricCard
          label="Flagged Items"
          value={data.flaggedItems}
          subtitle="Needs review"
          accentClass="accent-yellow"
        />
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>AI-Generated Insights</h3>
        </div>
        <div className="grid cols-2">
          {data.aiInsights.map((insight) => (
            <AIInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </>
  );
}