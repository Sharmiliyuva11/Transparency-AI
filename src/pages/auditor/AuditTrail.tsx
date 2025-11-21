import { useState, useEffect } from "react";
import { 
  Activity, 
  CheckCircle, 
  Flag,
  FileText,
  Search,
  Shield
} from "lucide-react";
import { FiChevronDown } from "react-icons/fi";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
}

function MetricCard({ icon, label, value, subtitle }: MetricCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "12px 0" }}>
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
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-label">{subtitle}</div>
    </div>
  );
}

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  actionType: string;
  details: string;
  timestamp: string;
}

interface TimelineItemProps {
  data: ActivityItem;
}

function TimelineItem({ data }: TimelineItemProps) {
  const getActionBadgeClass = (actionType: string): string => {
    const classes: Record<string, string> = {
      approved: "badge green",
      uploaded: "badge blue",
      flagged: "badge red",
      rejected: "badge red",
      generated: "badge blue",
      edited: "badge yellow",
      returned: "badge yellow"
    };
    return classes[actionType] || "badge blue";
  };

  const getIndicatorColor = (actionType: string): string => {
    const colors: Record<string, string> = {
      approved: "#38d788",
      uploaded: "#74b9ff",
      flagged: "#ff6b6b",
      rejected: "#ff6b6b",
      generated: "#74b9ff",
      edited: "#ffa94d",
      returned: "#ffa94d"
    };
    return colors[actionType] || "#74b9ff";
  };

  return (
    <div style={{ 
      display: "flex", 
      gap: "16px",
      position: "relative",
      paddingBottom: "24px"
    }}>
      <div style={{ 
        width: "12px", 
        height: "12px", 
        borderRadius: "50%",
        background: getIndicatorColor(data.actionType),
        marginTop: "6px",
        flexShrink: 0,
        zIndex: 1
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
            {data.user}
          </strong>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {data.timestamp}
          </span>
        </div>
        <div style={{ marginBottom: "6px" }}>
          <span className={getActionBadgeClass(data.actionType)}>
            {data.action}
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
          {data.details}
        </p>
      </div>
    </div>
  );
}

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Actions");
  const [activityLogData, setActivityLogData] = useState<any[]>([]);
  const [recentActivityData, setRecentActivityData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalActivities: 0,
    actionCounts: {},
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/activity-logs?limit=100"),
          fetch("http://127.0.0.1:5000/activity-logs/stats")
        ]);

        const logsData = await logsRes.json();
        const statsData = await statsRes.json();

        if (logsData.success) {
          setActivityLogData(logsData.activities || []);
          setRecentActivityData(logsData.activities?.slice(0, 5) || []);
        }

        if (statsData.success) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Error fetching audit trail data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActionBadgeClass = (actionType: string): string => {
    const classes: Record<string, string> = {
      approved: "badge green",
      uploaded: "badge blue",
      flagged: "badge red",
      rejected: "badge red",
      generated: "badge blue",
      edited: "badge yellow",
      returned: "badge yellow"
    };
    return classes[actionType] || "badge blue";
  };

  const approvalCount = stats.approvals || 0;
  const flagCount = stats.flagsRejections || 0;
  const reportCount = stats.reportsGenerated || 0;

  const getFilterActionTypes = (filter: string): string[] => {
    const filterMap: Record<string, string[]> = {
      "All Actions": [],
      "Approved Expenses": ["approved"],
      "Uploaded Receipts": ["uploaded"],
      "Flagged Items": ["flagged"],
      "Rejected Items": ["rejected"],
      "Generated Reports": ["generated"]
    };
    return filterMap[filter] || [];
  };

  const filteredActivityData = activityLogData.filter((activity) => {
    const actionTypes = getFilterActionTypes(selectedFilter);
    
    const matchesFilter = actionTypes.length === 0 || actionTypes.includes(activity.actionType);
    const matchesSearch = 
      searchQuery === "" ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const filteredRecentActivity = recentActivityData.filter((activity) => {
    const actionTypes = getFilterActionTypes(selectedFilter);
    
    const matchesFilter = actionTypes.length === 0 || actionTypes.includes(activity.actionType);
    const matchesSearch = 
      searchQuery === "" ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Metric Cards */}
      <div className="grid cols-4">
        <MetricCard
          icon={<Activity size={20} color="#3ba8ff" />}
          label="Total Activities"
          value={stats.totalActivities || 0}
          subtitle="Last 30 days"
        />
        <MetricCard
          icon={<CheckCircle size={20} color="#38d788" />}
          label="Approvals"
          value={approvalCount}
          subtitle="Actions completed"
        />
        <MetricCard
          icon={<Flag size={20} color="#ff6b6b" />}
          label="Flags/Rejections"
          value={flagCount}
          subtitle="Issues actions"
        />
        <MetricCard
          icon={<FileText size={20} color="#3ba8ff" />}
          label="Reports Generated"
          value={reportCount}
          subtitle="Last 7 reports"
        />
      </div>

      {/* Search and Filter Section */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search 
            size={18} 
            style={{ 
              position: "absolute", 
              left: "16px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "var(--text-secondary)"
            }} 
          />
          <input
            type="text"
            placeholder="Search activities by user, action, or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "48px", width: "100%" }}
          />
        </div>
        <div style={{ position: "relative", minWidth: "180px" }}>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="input-field"
            style={{ 
              paddingRight: "40px",
              appearance: "none",
              cursor: "pointer",
              width: "100%"
            }}
          >
            <option>All Actions</option>
            <option>Approved Expenses</option>
            <option>Uploaded Receipts</option>
            <option>Flagged Items</option>
            <option>Rejected Items</option>
            <option>Generated Reports</option>
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

      {/* Activity Log Table */}
      <div className="section-card">
        <div className="section-header">
          <h3>Activity Log ({filteredActivityData.length} entries)</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivityData.length > 0 ? (
                filteredActivityData.map((activity) => (
                  <tr key={activity.id}>
                    <td style={{ fontSize: "13px" }}>{activity.timestamp}</td>
                    <td>{activity.user}</td>
                    <td>
                      <span className={getActionBadgeClass(activity.actionType)}>
                        {activity.action}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      {activity.details}
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      {activity.ipAddress}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "24px" }}>
                    No activities found matching your filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="section-card">
        <div className="section-header">
          <h3>Recent Activity Timeline</h3>
        </div>
        <div style={{ 
          position: "relative",
          paddingLeft: "8px"
        }}>
          {filteredRecentActivity.length > 0 ? (
            <>
              {/* Vertical line */}
              <div style={{
                position: "absolute",
                left: "14px",
                top: "12px",
                bottom: "24px",
                width: "2px",
                background: "var(--border-soft)"
              }} />
              
              {/* Timeline items */}
              <div style={{ position: "relative" }}>
                {filteredRecentActivity.map((item) => (
                  <TimelineItem key={item.id} data={item} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "24px" }}>
              No recent activities found matching your filter
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Integrity */}
      <div className="section-card" style={{
        background: "var(--surface-info)",
        border: "1px solid rgba(59, 168, 255, 0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "rgba(59, 168, 255, 0.2)",
            display: "grid",
            placeContent: "center",
            border: "1px solid rgba(59, 168, 255, 0.4)"
          }}>
            <Shield size={24} color="#3ba8ff" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>
              Audit Trail Integrity
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
              All activities are logged with timestamps and IP addresses for complete transparency and accountability. This audit trail is immutable and cannot be modified or deleted, ensuring compliance with financial regulations.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                background: "rgba(56, 215, 136, 0.2)",
                color: "#38d788",
                border: "1px solid rgba(56, 215, 136, 0.4)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "default"
              }}
            >
              Blockchain Verified
            </button>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                background: "rgba(59, 168, 255, 0.2)",
                color: "#3ba8ff",
                border: "1px solid rgba(59, 168, 255, 0.4)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "default"
              }}
            >
              Tamper-Proof
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}