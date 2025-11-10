import { AlertTriangle, CheckCircle, Info, TrendingUp, Activity } from "lucide-react";

interface InsightCardProps {
  type: "anomaly" | "recommendation";
  title: string;
  description: string;
  icon: React.ReactNode;
  details?: string;
}

function InsightCard({ type, title, description, icon, details }: InsightCardProps) {
  const badgeClass = type === "anomaly" ? "badge red" : "badge blue";
  const badgeText = type === "anomaly" ? "Anomaly Detected" : "Recommendation";

  return (
    <div className="insight-detail-card">
      <div className="insight-card-header">
        <div className="insight-icon">{icon}</div>
        <span className={badgeClass}>{badgeText}</span>
      </div>
      <h4 className="insight-title">{title}</h4>
      <p className="insight-description">{description}</p>
      {details && <p className="insight-details">{details}</p>}
    </div>
  );
}

export default function AIInsights() {
  const insights: InsightCardProps[] = [
    {
      type: "anomaly",
      title: "Total Expenses Anomaly",
      description: "Total expenses increased by 15% this month compared to last month. This spike may be due to conference season.",
      icon: <TrendingUp size={24} />,
      details: "Last month: $1,470 | This month: $1,770"
    },
    {
      type: "anomaly",
      title: "Duplicate Receipt Found",
      description: "A duplicate receipt was found for Hotel Booking on 2025-10-15. Both receipts total $450. One receipt was submitted by the user.",
      icon: <AlertTriangle size={24} />,
      details: "Date: Oct 15"
    },
    {
      type: "recommendation",
      title: "Improved Documentation Rate",
      description: "Your documentation completeness has improved by 25% this quarter. All recent receipts include proper itemization and business purpose.",
      icon: <CheckCircle size={24} />,
      details: "Q3: 75% → Q4: 94.8%"
    },
    {
      type: "recommendation",
      title: "Office Supply Savings Opportunity",
      description: "A vendor is offering recurring items from Staples at a 15% lower price point than your current vendor. Consider switching to save $170/month.",
      icon: <Info size={24} />,
      details: "Potential savings: $170/month"
    },
    {
      type: "anomaly",
      title: "Unusual Vendor Activity",
      description: "A sudden surge in activity with a new vendor was detected. Five receipts from 'Tech Trader' were submitted in the last week. This vendor was not previously used.",
      icon: <Activity size={24} />,
      details: "Vendor: Tech Trader | Receipts: 5 | Total: $1,250"
    }
  ];

  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <h3>AI Insights</h3>
        </div>
        <div className="insights-list">
          {insights.map((insight, index) => (
            <InsightCard key={index} {...insight} />
          ))}
        </div>
      </div>
    </>
  );
}