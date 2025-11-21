import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const statusBadges: Record<string, string> = {
  Verified: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

const flagBadges: Record<string, string> = {
  Clean: "badge green",
  Flagged: "badge red"
};

export default function AuditorOverview() {
  const [overviewData, setOverviewData] = useState<any>({
    totalTransactions: 0,
    complianceRate: 0,
    aiReviewedFlags: 0,
    policyViolations: 0,
    complianceData: { compliant: 100, warning: 0, violation: 0 },
    reviewStats: [],
    transactions: [],
    auditTrail: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard/auditor-overview");
        const data = await response.json();
        
        if (data.success) {
          setOverviewData(data);
        }
      } catch (error) {
        console.error("Error fetching auditor overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const complianceChartData = overviewData.complianceData 
    ? [
        { name: "Compliant", value: Math.round(overviewData.complianceData.compliant), color: "#38d788" },
        ...(overviewData.complianceData.warning > 0 ? [{ name: "Warning", value: Math.round(overviewData.complianceData.warning), color: "#ffa94d" }] : []),
        ...(overviewData.complianceData.violation > 0 ? [{ name: "Violation", value: Math.round(overviewData.complianceData.violation), color: "#ff6b6b" }] : [])
      ]
    : [];

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <h2 className="dashboard-title">Auditor Dashboard</h2>
        <p className="dashboard-subtitle">Comprehensive oversight and compliance verification</p>
      </div>
      <div className="grid cols-4">
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{overviewData.totalTransactions}</div>
          <div className="stat-label">This audit period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Compliance Rate</div>
          <div className="stat-value">{overviewData.complianceRate.toFixed(1)}%</div>
          <div className="stat-label">Current status</div>
        </div>
        <div className="stat-card accent-green">
          <div className="stat-label">AI Flags Reviewed</div>
          <div className="stat-value">{overviewData.aiReviewedFlags}</div>
          <div className="stat-label">Anomalies verified</div>
        </div>
        <div className="stat-card accent-red">
          <div className="stat-label">Policy Violations</div>
          <div className="stat-value">{overviewData.policyViolations}</div>
          <div className="stat-label">Require attention</div>
        </div>
      </div>
      <div className="grid cols-2">
        <div className="section-card">
          <div className="section-header">
            <h3>Compliance Overview</h3>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={complianceChartData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={4}>
                  {complianceChartData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0c1736", borderRadius: 12, border: "1px solid rgba(71,102,190,0.45)" }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid cols-3">
            {complianceChartData.map((item) => (
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
            <h3>Admin Review Statistics</h3>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={overviewData.reviewStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2a4d" />
                <XAxis dataKey="month" stroke="#5870a5" />
                <YAxis stroke="#5870a5" />
                <Tooltip
                  contentStyle={{ background: "#0c1736", borderRadius: 12, border: "1px solid rgba(71,102,190,0.45)" }}
                  labelStyle={{ color: "#99a5cc" }}
                  itemStyle={{ color: "#e6ecff" }}
                />
                <Bar dataKey="verified" fill="#38d788" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="flagged" fill="#ff6b6b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="section-card">
        <div className="section-header">
          <h3>All Transactions (Read-only Access)</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Status</th>
              <th>AI Flag</th>
            </tr>
          </thead>
          <tbody>
            {(overviewData.transactions || []).map((txn: any) => (
              <tr key={txn.vendor + txn.date}>
                <td>{txn.date}</td>
                <td>{txn.user}</td>
                <td>{txn.vendor}</td>
                <td>{txn.amount}</td>
                <td>
                  <span className="badge blue">{txn.category}</span>
                </td>
                <td>
                  <span className={statusBadges[txn.status]}>{txn.status}</span>
                </td>
                <td>
                  <span className={flagBadges[txn.aiFlag]}>{txn.aiFlag}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-card">
        <div className="section-header">
          <h3>Recent Audit Trail Activity</h3>
        </div>
        <div className="audit-feed">
          {(overviewData.auditTrail || []).map((entry: any) => (
            <div key={entry.timestamp} className="audit-item">
              <strong>{entry.title}</strong>
              <span>{entry.action}</span>
              <span>{entry.detail}</span>
              <span>{entry.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}