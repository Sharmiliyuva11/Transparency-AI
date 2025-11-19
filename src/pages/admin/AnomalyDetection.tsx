import { useState, useEffect } from "react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { formatCurrency, formatDateTime, formatConfidence, formatPercentage } from "./anomalyDetectionUtils";

interface AnomalyReasonData {
  name: string;
  value: number;
  color: string;
}

interface FlaggedTransaction {
  id: number;
  dateTime: string;
  vendorName: string;
  category: string;
  amount: number;
  anomalyType: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
}

interface RecentFlag {
  id: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  summary: string;
  description?: string;
  details?: string;
  timestamp: string;
}

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
  onView: (id: number) => void;
  onReject: (id: number) => void;
}

function FlaggedTransactionRow({ transaction, onView, onReject }: FlaggedTransactionRowProps) {
  const formatTransactionDateTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <tr>
      <td>{formatTransactionDateTime(transaction.dateTime)}</td>
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
  const API_URL = "http://127.0.0.1:5000";
  
  const [totalCharges, setTotalCharges] = useState<number>(0);
  const [anomalousTransactions, setAnomalousTransactions] = useState<number>(0);
  const [averageDeviation, setAverageDeviation] = useState<number>(0);
  const [detectionAccuracy, setDetectionAccuracy] = useState<number>(0);
  const [modulationData, setModulationData] = useState<any[]>([]);
  const [anomalyReasonDistribution, setAnomalyReasonDistribution] = useState<AnomalyReasonData[]>([]);
  const [flaggedTransactions, setFlaggedTransactions] = useState<FlaggedTransaction[]>([]);
  const [recentFlags, setRecentFlags] = useState<RecentFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const fetchAnomalyData = async () => {
    setLoading(true);
    try {
      const [statsRes, anomaliesRes, recentRes] = await Promise.all([
        fetch(`${API_URL}/anomalies/stats`),
        fetch(`${API_URL}/anomalies`),
        fetch(`${API_URL}/anomalies/recent?limit=5`)
      ]);

      if (statsRes.ok && anomaliesRes.ok && recentRes.ok) {
        const statsData = await statsRes.json();
        const anomaliesData = await anomaliesRes.json();
        const recentData = await recentRes.json();

        if (statsData.success) {
          setTotalCharges(statsData.totalCharges || 0);
          setAnomalousTransactions(statsData.anomalousTransactions || 0);
          setDetectionAccuracy(statsData.detectionAccuracy || 0);
          
          const anomalyTypeData = Object.entries(statsData.anomalyTypes || {}).map(([type, count]) => ({
            name: type as string,
            value: count as number,
            color: getColorForAnomalyType(type)
          }));
          setAnomalyReasonDistribution(anomalyTypeData);
          
          if (anomaliesData.anomalies && anomaliesData.anomalies.length > 0) {
            setAverageDeviation(
              anomaliesData.anomalies.reduce((sum: number, a: any) => sum + a.amount, 0) / 
              anomaliesData.anomalies.length
            );
          }
        }

        if (anomaliesData.success && anomaliesData.anomalies) {
          const transactions = anomaliesData.anomalies.map((a: any) => ({
            id: a.id,
            dateTime: a.dateTime,
            vendorName: a.vendorName,
            category: a.category,
            amount: a.amount,
            anomalyType: a.anomalyType,
            severity: a.severity,
            confidence: a.confidence
          }));
          setFlaggedTransactions(transactions);
        }

        if (recentData.success && recentData.anomalies) {
          const flags = recentData.anomalies.map((a: any) => ({
            id: a.id,
            severity: a.severity,
            title: a.anomalyType,
            summary: a.description,
            description: a.description,
            details: a.description,
            timestamp: a.detectedAt
          }));
          setRecentFlags(flags);
        }

        setModulationData(generateModulationData(anomaliesData.anomalies || []));
      }
    } catch (err) {
      console.error("Error fetching anomaly data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateModulationData = (anomalies: any[]) => {
    const monthCounts: { [key: string]: number } = {};
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    anomalies.forEach((a: any) => {
      if (a.detectedAt) {
        const date = new Date(a.detectedAt);
        const monthName = monthOrder[date.getMonth()];
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    });

    return monthOrder.map(month => ({
      month,
      value: monthCounts[month] || 0
    }));
  };

  const getColorForAnomalyType = (type: string): string => {
    const colors: Record<string, string> = {
      "Unusual Amount": "#ff6b6b",
      "Duplicate Detection": "#ffa94d",
      "Unusual Vendor": "#ffd93d",
      "Unknown Vendor": "#6bcf7f"
    };
    return colors[type] || "#3ba8ff";
  };

  const handleView = (id: number) => {
    console.log("View transaction:", id);
  };

  const handleReject = (id: number) => {
    console.log("Reject transaction:", id);
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading anomaly data...</div>;
  }

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <h2 className="dashboard-title">Anomaly Detection</h2>
        <p className="dashboard-subtitle">AI-powered fraud and expense anomaly detection</p>
      </div>

      <div className="grid cols-4">
        <MetricCard
          label="Total Charges"
          value={formatCurrency(totalCharges)}
          subtitle="This month"
        />
        <MetricCard
          label="Anomalous Transactions"
          value={anomalousTransactions}
          subtitle="Detected anomalies"
        />
        <MetricCard
          label="Average Deviation Amount"
          value={formatCurrency(averageDeviation)}
          subtitle="From baseline"
          accentClass="accent-yellow"
        />
        <MetricCard
          label="Detection Accuracy"
          value={formatPercentage(detectionAccuracy)}
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
              <LineChart data={modulationData}>
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
                  data={anomalyReasonDistribution}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {anomalyReasonDistribution.map((entry) => (
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
            {anomalyReasonDistribution.map((item) => (
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
                  {item.name} ({item.value})
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
            {flaggedTransactions.map((transaction) => (
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
          {recentFlags.map((flag) => (
            <AIExplainabilityCard key={flag.id} flag={flag} />
          ))}
        </div>
      </div>
    </>
  );
}