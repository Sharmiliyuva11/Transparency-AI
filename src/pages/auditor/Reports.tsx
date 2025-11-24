import { useEffect, useState } from "react";
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
import jsPDF from "jspdf";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  accentClass?: string;
}

interface AIInsight {
  id: string;
  type: string;
  severity: "Info" | "Alert" | "Success" | "Warning";
  message: string;
}

interface ReportsData {
  totalExpenses: number;
  complianceRate: number;
  averagePerTransaction: number;
  flaggedItems: number;
  flaggedAmount: number;
  expenseTrendData: { month: string; amount: number }[];
  categorySpendingData: { category: string; amount: number }[];
  fraudDetectionData: { category: string; count: number; fill: string }[];
  aiInsights: AIInsight[];
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
    Info: "📊",
    Alert: "⚠️",
    Success: "✓",
    Warning: "⚡"
  };

  return (
    <div
      style={{
        background: "rgba(59, 168, 255, 0.1)",
        border: "1px solid rgba(71,102,190,0.45)",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        gap: "12px"
      }}
    >
      <div style={{ fontSize: "20px" }}>{severityIcons[insight.severity]}</div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}>
          {insight.type}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          {insight.message}
        </div>
      </div>
    </div>
  );
}

export default function AuditorReports() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("Last 5 Months");
  const [department, setDepartment] = useState("All Departments");
  const [category, setCategory] = useState("All Categories");

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("dateRange", dateRange);
        if (category && category !== "All Categories") {
          params.append("category", category);
        }
        const response = await fetch(`http://localhost:5000/api/auditor/reports?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setData({
            totalExpenses: result.totalExpenses,
            complianceRate: result.complianceRate,
            averagePerTransaction: result.averagePerTransaction,
            flaggedItems: result.flaggedItems,
            flaggedAmount: result.flaggedAmount || 0,
            expenseTrendData: result.expenseTrendData || [],
            categorySpendingData: result.categorySpendingData || [],
            fraudDetectionData: result.fraudDetectionData || [],
            aiInsights: result.aiInsights || []
          });
        } else {
          throw new Error(result.error || "Failed to fetch reports");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch reports data";
        setError(errorMessage);
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [dateRange, category]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading reports...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "var(--logout-color)" }}>Error: {error || "No data available"}</p>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 10;

      doc.setFillColor(12, 23, 54);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setFillColor(59, 168, 255);
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont(undefined, "bold");
      doc.text("EXPENSE AUDIT REPORT", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(11);
      doc.setFont(undefined, "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, 32, { align: "center" });

      yPosition = 50;

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("SUMMARY STATISTICS", 15, yPosition);
      yPosition += 12;

      const metrics = [
        { label: "Total Expenses", value: `$${data.totalExpenses.toFixed(2)}`, color: [58, 168, 255] },
        { label: "Compliance Rate", value: `${data.complianceRate}%`, color: [56, 215, 136] },
        { label: "Avg Per Transaction", value: `$${data.averagePerTransaction.toFixed(2)}`, color: [255, 169, 77] },
        { label: "Flagged Items", value: `${data.flaggedItems}`, color: [255, 107, 107] }
      ];

      metrics.forEach((metric, index) => {
        const xPos = 15 + (index % 2) * 90;
        const yPos = yPosition + Math.floor(index / 2) * 20;

        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.rect(xPos, yPos, 80, 15, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text(metric.label, xPos + 5, yPos + 6);

        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(metric.value, xPos + 5, yPos + 12);
      });

      yPosition += 50;

      doc.setFillColor(59, 168, 255);
      doc.rect(15, yPosition - 8, pageWidth - 30, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("EXPENSE TREND", 15, yPosition - 2);

      yPosition += 8;
      doc.setTextColor(200, 200, 220);
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");

      data.expenseTrendData.forEach((item) => {
        doc.text(`${item.month}: $${item.amount.toFixed(2)}`, 20, yPosition);
        yPosition += 6;
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          doc.setFillColor(12, 23, 54);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          yPosition = 20;
        }
      });

      yPosition += 6;

      doc.setFillColor(56, 215, 136);
      doc.rect(15, yPosition - 8, pageWidth - 30, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("CATEGORY-WISE SPENDING", 15, yPosition - 2);

      yPosition += 8;
      doc.setTextColor(200, 200, 220);
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");

      data.categorySpendingData.forEach((item) => {
        const percentage = ((item.amount / data.totalExpenses) * 100).toFixed(1);
        doc.text(`${item.category}: $${item.amount.toFixed(2)} (${percentage}%)`, 20, yPosition);
        yPosition += 6;
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          doc.setFillColor(12, 23, 54);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          yPosition = 20;
        }
      });

      yPosition += 8;

      doc.setFillColor(255, 169, 77);
      doc.rect(15, yPosition - 8, pageWidth - 30, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("AI INSIGHTS & RECOMMENDATIONS", 15, yPosition - 2);

      yPosition += 10;

      data.aiInsights.forEach((insight) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          doc.setFillColor(12, 23, 54);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          yPosition = 20;
        }

        const severityColors: Record<string, number[]> = {
          Info: [58, 168, 255],
          Alert: [255, 107, 107],
          Success: [56, 215, 136],
          Warning: [255, 169, 77]
        };

        const color = severityColors[insight.severity] || [100, 100, 100];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(18, yPosition + 2, 2, "F");

        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text(`[${insight.severity}] ${insight.type}`, 23, yPosition);

        doc.setTextColor(200, 200, 220);
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        const splitMessage = doc.splitTextToSize(insight.message, pageWidth - 40);
        doc.text(splitMessage, 23, yPosition + 6);

        yPosition += 6 + splitMessage.length * 5 + 4;
      });

      yPosition = pageHeight - 15;
      doc.setTextColor(100, 120, 165);
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text("Transparency-AI Expense Audit System", pageWidth / 2, yPosition, { align: "center" });
      doc.text(`Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth / 2, yPosition + 5, { align: "center" });

      const filename = `ExpenseAuditReport_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF report");
    }
  };

  return (
    <>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="dashboard-title">Expense Reports and Insights</h2>
          <p className="dashboard-subtitle">Comprehensive analysis of spending patterns and anomalies</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          style={{
            background: "linear-gradient(135deg, #3ba8ff, #24e0ff)",
            color: "#041024",
            padding: "12px 20px",
            borderRadius: "12px",
            border: "none",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 18px 35px rgba(32, 152, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: "16px" }}>⬇️</span>
          Download Report (PDF)
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid cols-3" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
            📅 Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
            style={{ cursor: "pointer" }}
          >
            <option>Last 5 Months</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
            🏢 Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input-field"
            style={{ cursor: "pointer" }}
          >
            <option>All Departments</option>
            <option>Finance</option>
            <option>HR</option>
            <option>Operations</option>
            <option>Marketing</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
            📊 Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
            style={{ cursor: "pointer" }}
          >
            <option>All Categories</option>
            <option>Travel</option>
            <option>Food</option>
            <option>Office</option>
            <option>IT</option>
          </select>
        </div>
      </div>

      {/* Expense Trend Chart */}
      <div className="section-card">
        <div className="section-header">
          <h3>Expense Trend Over Time</h3>
          <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
            <span className="badge blue">{dateRange}</span>
            <span className="badge blue">{department}</span>
          </div>
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={data.expenseTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b2a4d" />
              <XAxis dataKey="month" stroke="#5870a5" />
              <YAxis stroke="#5870a5" />
              <Tooltip
                contentStyle={{ background: "#0c1736", borderRadius: 12, border: "1px solid rgba(71,102,190,0.45)" }}
                labelStyle={{ color: "#99a5cc" }}
                itemStyle={{ color: "#e6ecff" }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Legend
                wrapperStyle={{ color: "var(--text-secondary)" }}
                contentStyle={{ background: "transparent" }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3ba8ff"
                strokeWidth={2}
                dot={{ fill: "#3ba8ff", r: 4 }}
                name="Total Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid cols-2">
        {/* Category-Wise Spending */}
        <div className="section-card">
          <div className="section-header">
            <h3>Category-Wise Spending</h3>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart
                data={data.categorySpendingData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2a4d" />
                <XAxis type="number" stroke="#5870a5" />
                <YAxis dataKey="category" type="category" stroke="#5870a5" width={100} />
                <Tooltip
                  contentStyle={{ background: "#0c1736", borderRadius: 12, border: "1px solid rgba(71,102,190,0.45)" }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="amount" fill="#3ba8ff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fraud Detection Statistics */}
        <div className="section-card">
          <div className="section-header">
            <h3>Fraud Detection Statistics</h3>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={data.fraudDetectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2a4d" />
                <XAxis dataKey="category" stroke="#5870a5" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#5870a5" />
                <Tooltip
                  contentStyle={{ background: "#0c1736", borderRadius: 12, border: "1px solid rgba(71,102,190,0.45)" }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.fraudDetectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid cols-4">
        <MetricCard
          label="Total Analyzed"
          value={data.expenseTrendData.length > 0 ? Object.keys(data.categorySpendingData).length + data.flaggedItems : 0}
          subtitle="Transactions"
        />
        <MetricCard
          label="Clean Data"
          value={`${data.complianceRate}%`}
          subtitle="No issues detected"
          accentClass="accent-green"
        />
        <MetricCard
          label="Flagged Amounts"
          value={`$${(data.flaggedAmount / 1000).toFixed(1)}K`}
          subtitle="Under review"
          accentClass="accent-yellow"
        />
        <MetricCard
          label="Avg Resolution"
          value="2.3"
          subtitle="Days"
          accentClass="accent-red"
        />
      </div>

      {/* AI-Generated Insights */}
      <div className="section-card">
        <div className="section-header">
          <h3>AI-Generated Insights</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.aiInsights.map((insight) => (
            <AIInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </>
  );
}
