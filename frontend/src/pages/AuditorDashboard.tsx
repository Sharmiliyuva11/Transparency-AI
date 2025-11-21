import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { FiHome, FiSearch, FiSettings, FiBarChart } from 'react-icons/fi';
import { AlertTriangle, Clock, CheckCircle, Target } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SidebarItem } from '../components/DashboardLayout';

const auditorSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: <FiHome />, active: false },
  { label: 'Anomaly Review', icon: <FiSearch />, active: true },
  { label: 'Analytics', icon: <FiBarChart /> },
  { label: 'Settings', icon: <FiSettings /> },
];

export const AuditorDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>({
    totalCharges: 0,
    anomalousTransactions: 0,
    flaggedExpenses: 0,
    detectionAccuracy: 0,
    severityCounts: { Critical: 0, High: 0, Medium: 0, Low: 0 },
    anomalyTypes: {},
    averageConfidence: 0
  });
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, anomaliesRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/anomalies/stats'),
          fetch('http://127.0.0.1:5000/anomalies')
        ]);

        const statsData = await statsRes.json();
        const anomaliesData = await anomaliesRes.json();

        if (statsData.success) {
          setDashboardData(statsData);
        }

        if (anomaliesData.success) {
          setAnomalies(anomaliesData.anomalies || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const STATS_DATA = [
    {
      title: 'Total Flagged',
      value: dashboardData.flaggedExpenses?.toString() || '0',
      subtitle: 'This month',
      icon: AlertTriangle,
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-500',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Pending Reviews',
      value: dashboardData.severityCounts?.High?.toString() || '0',
      subtitle: 'Awaiting admin action',
      icon: Clock,
      bgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-500/20',
    },
    {
      title: 'Critical Issues',
      value: dashboardData.severityCounts?.Critical?.toString() || '0',
      subtitle: 'Require immediate attention',
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'AI Accuracy',
      value: dashboardData.detectionAccuracy?.toFixed(1) + '%' || '0%',
      subtitle: 'Detection accuracy',
      icon: Target,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/20',
    },
  ];

  const anomalyTypeStats = Object.entries(dashboardData.anomalyTypes || {}).map(([name, count]) => ({
    name,
    value: (count as number),
    color: ['#ef4444', '#f97316', '#94a3b8', '#eab308', '#64748b'][Object.keys(dashboardData.anomalyTypes || {}).indexOf(name) % 5]
  }));

  const ANOMALIES_OVER_TIME = [
    { month: 'May', count: 9 },
    { month: 'Jun', count: 12 },
    { month: 'Jul', count: 7 },
    { month: 'Aug', count: 10 },
    { month: 'Sep', count: 6 },
    { month: 'Oct', count: 8 },
  ];

  const flaggedTransactions = anomalies.slice(0, 6).map((anomaly: any) => ({
    date: anomaly.dateTime?.split('T')[0] || 'N/A',
    user: 'User ' + ((anomaly.expenseId || 1) % 10 + 1),
    vendor: anomaly.vendorName || 'Unknown',
    amount: '$' + (anomaly.amount || 0).toFixed(2),
    reason: anomaly.anomalyType,
    reasonColor: getSeverityColor(anomaly.severity, 'reason'),
    severity: anomaly.severity?.toLowerCase() || 'low',
    severityColor: getSeverityColor(anomaly.severity, 'badge'),
    confidence: Math.round(anomaly.confidence || 0) + '%',
  }));

  function getSeverityColor(severity: string, type: 'reason' | 'badge') {
    const severityUpper = severity?.toUpperCase() || '';
    if (type === 'reason') {
      if (severityUpper === 'CRITICAL' || severityUpper === 'HIGH') return 'bg-red-500/20 text-red-400 border-red-500/30';
      if (severityUpper === 'MEDIUM') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    } else {
      if (severityUpper === 'CRITICAL' || severityUpper === 'HIGH') return 'bg-red-500/20 text-red-400';
      if (severityUpper === 'MEDIUM') return 'bg-yellow-500/20 text-yellow-400';
      return 'bg-blue-500/20 text-blue-400';
    }
  }

  const topAnomaly = anomalies[0];

  return (
    <DashboardLayout
      role="Auditor"
      user="Jane Smith"
      sidebarItems={auditorSidebarItems}
    >
      <div className="min-h-screen bg-[#0a0e1a] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Anomaly Detection</h1>
            <p className="text-gray-400 text-sm">AI-powered fraud and suspicious transaction monitoring</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
            <span>All Severities</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS_DATA.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-5`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 mb-1">{stat.title}</div>
                <div className="text-xs text-gray-500">{stat.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Anomalies Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ANOMALIES_OVER_TIME}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Anomaly Reason Distribution</h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={300}>
                <PieChart>
                  <Pie
                    data={anomalyTypeStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {anomalyTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {anomalyTypeStats.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: reason.color }}
                      />
                      <span className="text-sm text-gray-300">{reason.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{reason.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flagged Transactions Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-white">Flagged Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Vendor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Severity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">AI Confidence</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {flaggedTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-300">{transaction.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{transaction.user}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{transaction.vendor}</td>
                    <td className="py-3 px-4 text-sm text-white font-medium">{transaction.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${transaction.reasonColor}`}>
                        {transaction.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${transaction.severityColor}`}>
                        {transaction.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-white font-medium">{transaction.confidence}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors border border-green-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Valid
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors border border-red-500/30">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Explainability Section */}
        {topAnomaly && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">AI Explainability - Recent Flags</h3>
                  <span className="text-xs font-medium text-red-400 bg-red-500/20 px-2 py-1 rounded">{topAnomaly.severity?.toUpperCase() || 'HIGH'}</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  <span className="font-medium text-white">{topAnomaly.vendorName || 'Unknown Vendor'} - ${topAnomaly.amount || 0}</span>
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  <span className="font-medium text-red-400">{topAnomaly.anomalyType}:</span> {topAnomaly.description || 'This transaction has been flagged by the AI detection system.'}
                </p>
                <div className="mt-3 pt-3 border-t border-red-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Confidence Level</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: Math.round(topAnomaly.confidence || 0) + '%' }} />
                      </div>
                      <span className="text-xs font-medium text-white">{Math.round(topAnomaly.confidence || 0)}% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};