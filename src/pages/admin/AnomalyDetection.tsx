import { useState } from "react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import type {
  AnomalyDetectionProps,
  FlaggedTransaction,
  RecentFlag
} from "./anomalyDetectionMockData";
import { mockRootProps } from "./anomalyDetectionMockData";
import { formatCurrency, formatDateTime, formatConfidence, formatPercentage } from "./anomalyDetectionUtils";

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

interface SeverityBadgeProps {
  severity: "Critical" | "High" | "Medium" | "Low";
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  const severityClasses: Record<string, string> = {
    Critical: "badge red",
    High: "badge yellow",
    Medium: "badge blue",
    Low: "badge green"
  };

  return <span className={severityClasses[severity]}>{severity}</span>;
}

interface FlaggedTransactionRowProps {
  transaction: FlaggedTransaction;
  onView: (id: string) => void;
  onReject: (id: string) => void;
}

function FlaggedTransactionRow({ transaction, onView, onReject }: FlaggedTransactionRowProps) {
  return (
    <tr>
      <td>{formatDateTime(transaction.dateTime)}</td>
      <td>{transaction.vendorName}</td>
      <td>
        <span className="badge blue">{transaction.category}</span>
      </td>
      <td>{formatCurrency(transaction.amount)}</td>
      <td>
        <span className="badge blue">{transaction.anomalyType}</span>
      </td>
      <td>
        <SeverityBadge severity={transaction.severity} />
      </td>
      <td>{formatConfidence(transaction.confidence)}</td>
      <td>
        <button
          className="secondary-link"
          onClick={() => onView(transaction.id)}
          style={{ marginRight: "8px", background: "none", border: "none", padding: 0 }}
        >
          View
        </button>
        <button
          className="secondary-link"
          onClick={() => onReject(transaction.id)}
          style={{ background: "none", border: "none", padding: 0, color: "var(--logout-color)" }}
        >
          Reject
        </button>
      </td>
    </tr>
  );
}

interface AIExplainabilityCardProps {
  flag: RecentFlag;
}

function AIExplainabilityCard({ flag }: AIExplainabilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityColors: Record<string, string> = {
    Critical: "var(--badge-red-color)",
    High: "var(--badge-yellow-color)",
    Medium: "var(--badge-blue-color)",
    Low: "var(--badge-green-color)"
  };

  const severityBgColors: Record<string, string> = {
    Critical: "var(--badge-red-bg)",
    High: "var(--badge-yellow-bg)",
    Medium: "var(--badge-blue-bg)",
    Low: "var(--badge-green-bg)"
  };

  return (
    <div
      className="section-card"
      style={{
        borderColor: severityColors[flag.severity],
        borderWidth: "1px",
        borderStyle: "solid"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: severityBgColors[flag.severity],
            color: severityColors[flag.severity],
            fontWeight: 600,
            fontSize: "13px"
          }}
        >
          {flag.severity}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>{flag.title}</h4>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {flag.summary}
          </p>
          {isExpanded && (
            <div
              style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid var(--border-soft)"
              }}
            >
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {flag.details}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="icon-button"
          style={{ flexShrink: 0 }}
        >
          {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function AnomalyDetection() {
  const data: AnomalyDetectionProps = mockRootProps;

  const handleView = (id: string) => {
    console.log("View transaction:", id);
  };

  const handleReject = (id: string) => {
    console.log("Reject transaction:", id);
  };

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <h2 className="dashboard-title">Anomaly Detection</h2>
        <p className="dashboard-subtitle">AI-powered fraud and expense anomaly detection</p>
      </div>

      <div className="grid cols-4">
        <MetricCard
          label="Total Charges"
          value={formatCurrency(data.totalCharges)}
          subtitle="This month"
        />
        <MetricCard
          label="Anomalous Transactions"
          value={data.anomalousTransactions}
          subtitle="Detected anomalies"
        />
        <MetricCard
          label="Average Deviation Amount"
          value={formatCurrency(data.averageDeviation)}
          subtitle="From baseline"
          accentClass="accent-yellow"
        />
        <MetricCard
          label="Detection Accuracy"
          value={formatPercentage(data.detectionAccuracy)}
          subtitle="Success rate"
          accentClass="accent-green"
        />
      </div>

      <div className="grid cols-2">
        <div className="section-card">
          <div className="section-header">
            <h3>Modulation Over Time</h3>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={data.modulationData}>
                <XAxis
                  dataKey="month"
                  stroke="#5870a5"
                  dy={6}
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: "12px" }}
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
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ff6b6b"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#ff6b6b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h3>Anomaly Reason Distribution</h3>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.anomalyReasonDistribution}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {data.anomalyReasonDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0c1736",
                    borderRadius: 12,
                    border: "1px solid rgba(71,102,190,0.45)"
                  }}
                  itemStyle={{ color: "#e6ecff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid cols-2" style={{ marginTop: "16px" }}>
            {data.anomalyReasonDistribution.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: item.color
                  }}
                />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Flagged Transactions</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Vendor Name</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Anomaly Type</th>
              <th>Severity</th>
              <th>Confidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.flaggedTransactions.map((transaction) => (
              <FlaggedTransactionRow
                key={transaction.id}
                transaction={transaction}
                onView={handleView}
                onReject={handleReject}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>AI Explainability - Recent Flags</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {data.recentFlags.map((flag) => (
            <AIExplainabilityCard key={flag.id} flag={flag} />
          ))}
        </div>
      </div>
    </>
  );
}