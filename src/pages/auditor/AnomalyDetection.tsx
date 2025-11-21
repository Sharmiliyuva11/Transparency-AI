import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Target,
  Info,
  Check,
  X
} from "lucide-react";
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface AnomalyOverTime {
  month: string;
  count: number;
}

interface ReasonDistribution {
  name: string;
  value: number;
  color: string;
}

interface FlaggedTransaction {
  id: number;
  date: string;
  user: string;
  vendor: string;
  amount: string;
  reason: string;
  severity: "high" | "medium" | "low";
  confidence: number;
}

interface ExplainabilityItem {
  id: number;
  vendor: string;
  amount: string;
  severity: "high" | "medium" | "low";
  title: string;
  confidence: number;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  accentClass?: string;
}

function MetricCard({ icon, label, value, subtitle, accentClass }: MetricCardProps) {
  return (
    <div className={`stat-card ${accentClass || ""}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ 
          width: "42px", 
          height: "42px", 
          borderRadius: "12px",
          background: "var(--surface-icon)",
          display: "grid",
          placeContent: "center",
          border: "1px solid var(--border-soft)"
        }}>
          {icon}
        </div>
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{subtitle}</div>
    </div>
  );
}

interface ExplainabilityCardProps {
  data: ExplainabilityItem;
}

function ExplainabilityCard({ data }: ExplainabilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityColors: Record<string, string> = {
    high: "#ff6b6b",
    medium: "#ffa94d",
    low: "#74b9ff"
  };

  return (
    <div className="section-card" style={{ 
      borderLeft: `4px solid ${severityColors[data.severity]}`,
      cursor: "pointer"
    }}
    onClick={() => setIsExpanded(!isExpanded)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: `${severityColors[data.severity]}22`,
          display: "grid",
          placeContent: "center",
          flexShrink: 0
        }}>
          <Info size={20} color={severityColors[data.severity]} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div>
              <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                {data.vendor} - {data.amount}
              </strong>
              <span className={`badge ${data.severity === "high" ? "red" : data.severity === "medium" ? "yellow" : "blue"}`} style={{ marginLeft: "12px", textTransform: "uppercase" }}>
                {data.severity}
              </span>
            </div>
            {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", margin: "8px 0" }}>
            {data.title}
          </p>
          {isExpanded && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-soft)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>AI Confidence:</span>
                <div style={{ 
                  flex: 1, 
                  height: "8px", 
                  background: "var(--surface-input)", 
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    width: `${data.confidence}%`, 
                    height: "100%", 
                    background: `linear-gradient(90deg, ${severityColors[data.severity]}, ${severityColors[data.severity]}dd)`,
                    borderRadius: "4px"
                  }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {data.confidence}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnomalyDetection() {
  const [selectedScenario, setSelectedScenario] = useState("All Scenarios");
  const [totalFlagged, setTotalFlagged] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [approvedAfterReview, setApprovedAfterReview] = useState(0);
  const [aiAccuracy, setAiAccuracy] = useState(94.8);
  const [anomaliesOverTime, setAnomaliesOverTime] = useState<AnomalyOverTime[]>([]);
  const [reasonDistribution, setReasonDistribution] = useState<ReasonDistribution[]>([]);
  const [flaggedTransactions, setFlaggedTransactions] = useState<FlaggedTransaction[]>([]);
  const [explainabilityData, setExplainabilityData] = useState<ExplainabilityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnomalyData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/auditor/anomalies");
        const data = await response.json();

        if (data.success) {
          setTotalFlagged(data.totalFlagged);
          setPendingReviews(data.pendingReviews);
          setApprovedAfterReview(data.approvedAfterReview);
          setAiAccuracy(data.aiAccuracy);
          setAnomaliesOverTime(data.anomaliesOverTime || []);
          setReasonDistribution(data.reasonDistribution || []);
          setFlaggedTransactions(data.flaggedTransactions || []);
          setExplainabilityData(data.explainabilityData || []);
        }
      } catch (error) {
        console.error("Error fetching anomaly data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalyData();
  }, []);

  const handleValidate = (id: number) => {
    console.log("Validate transaction:", id);
  };

  const handleReject = (id: number) => {
    console.log("Reject transaction:", id);
  };

  const severityBadgeClass = (severity: string): string => {
    const classes: Record<string, string> = {
      high: "badge red",
      medium: "badge yellow",
      low: "badge blue"
    };
    return classes[severity] || "badge blue";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
            Anomaly Detection
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            AI-powered fraud and suspicious transaction monitoring
          </p>
        </div>
        <div style={{ position: "relative" }}>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="input-field"
            style={{ 
              paddingRight: "40px",
              appearance: "none",
              cursor: "pointer",
              minWidth: "180px"
            }}
          >
            <option>All Scenarios</option>
            <option>Duplicate Receipts</option>
            <option>Excessive Amounts</option>
            <option>Missing Receipts</option>
            <option>Unusual Vendors</option>
          </select>
          <FiChevronDown 
            style={{ 
              position: "absolute", 
              right: "16px", 
              top: "50%", 
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "var(--text-secondary)"
            }} 
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid cols-4">
        <MetricCard
          icon={<AlertTriangle size={20} color="#ff6b6b" />}
          label="Total Flagged"
          value={totalFlagged}
          subtitle="This month"
          accentClass="accent-red"
        />
        <MetricCard
          icon={<Clock size={20} color="#ffa94d" />}
          label="Pending Reviews"
          value={pendingReviews}
          subtitle="Awaiting admin action"
          accentClass="accent-yellow"
        />
        <MetricCard
          icon={<CheckCircle size={20} color="#38d788" />}
          label="Approved After Review"
          value={approvedAfterReview}
          subtitle="False positives"
          accentClass="accent-green"
        />
        <MetricCard
          icon={<Target size={20} color="#3ba8ff" />}
          label="AI Accuracy"
          value={`${aiAccuracy}%`}
          subtitle="Detection accuracy"
        />
      </div>

      {/* Charts Section */}
      <div className="grid cols-2">
        {/* Anomalies Over Time */}
        <div className="section-card">
          <div className="section-header">
            <h3>Anomalies Over Time</h3>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={anomaliesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2a4d" />
                <XAxis 
                  dataKey="month" 
                  stroke="#5870a5"
                  style={{ fontSize: "13px" }}
                />
                <YAxis 
                  stroke="#5870a5"
                  style={{ fontSize: "13px" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0c1736",
                    borderRadius: 12,
                    border: "1px solid rgba(71,102,190,0.45)",
                    fontSize: "13px"
                  }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ff6b6b"
                  strokeWidth={3}
                  dot={{ fill: "#ff6b6b", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Reason Distribution */}
        <div className="section-card">
          <div className="section-header">
            <h3>Anomaly Reason Distribution</h3>
          </div>
          <div style={{ width: "100%", height: 280, position: "relative" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={reasonDistribution}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={{ stroke: "#5870a5" }}
                >
                  {reasonDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0c1736",
                    borderRadius: 12,
                    border: "1px solid rgba(71,102,190,0.45)",
                    fontSize: "13px"
                  }}
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Flagged Transactions Table */}
      <div className="section-card">
        <div className="section-header">
          <h3>
            <AlertTriangle size={18} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
            Flagged Transactions
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Severity</th>
                <th>AI Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {flaggedTransactions.length > 0 ? (
                flaggedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.user}</td>
                    <td>{transaction.vendor}</td>
                    <td style={{ fontWeight: 600 }}>{transaction.amount}</td>
                    <td>
                      <span className="badge blue">{transaction.reason}</span>
                    </td>
                    <td>
                      <span className={severityBadgeClass(transaction.severity)}>
                        {transaction.severity}
                      </span>
                    </td>
                    <td>{transaction.confidence}%</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleValidate(transaction.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "var(--badge-green-bg)",
                          color: "var(--badge-green-color)",
                          border: "1px solid var(--badge-green-color)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--badge-green-color)";
                          e.currentTarget.style.color = "#041024";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--badge-green-bg)";
                          e.currentTarget.style.color = "var(--badge-green-color)";
                        }}
                      >
                        <Check size={14} />
                        Valid
                      </button>
                      <button
                        onClick={() => handleReject(transaction.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "var(--badge-red-bg)",
                          color: "var(--badge-red-color)",
                          border: "1px solid var(--badge-red-color)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--badge-red-color)";
                          e.currentTarget.style.color = "#041024";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--badge-red-bg)";
                          e.currentTarget.style.color = "var(--badge-red-color)";
                        }}
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "24px" }}>
                    No flagged transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Explainability Section */}
      <div className="section-card">
        <div className="section-header">
          <h3>
            <Info size={18} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
            AI Explainability - Recent Flags
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {explainabilityData.length > 0 ? (
            explainabilityData.map((item) => (
              <ExplainabilityCard key={item.id} data={item} />
            ))
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "24px" }}>
              No explainability data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}