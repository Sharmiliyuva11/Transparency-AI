import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { FiHome, FiUpload, FiList, FiSettings } from 'react-icons/fi';
import type { SidebarItem } from '../components/DashboardLayout';
import { apiService, Expense, ExpenseStats } from '../services/api';

const employeeSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: <FiHome />, active: true },
  { label: 'Upload Receipt', icon: <FiUpload /> },
  { label: 'My Expenses', icon: <FiList /> },
  { label: 'Settings', icon: <FiSettings /> },
];

const MOCK_EXPENSES = [
  { id: '1', date: '2025-11-01', vendor: 'Coffee Shop', amount: 45, category: 'Food', status: 'approved' },
  { id: '2', date: '2025-10-30', vendor: 'Uber', amount: 28, category: 'Travel', status: 'approved' },
  { id: '3', date: '2025-10-28', vendor: 'Office Depot', amount: 120, category: 'Office', status: 'pending' },
  { id: '4', date: '2025-10-25', vendor: 'Hotel XYZ', amount: 450, category: 'Travel', status: 'flagged' },
  { id: '5', date: '2025-10-22', vendor: 'Restaurant', amount: 85, category: 'Food', status: 'approved' },
];

const MOCK_CATEGORY_DATA = [
  { name: 'Travel', value: 60 },
  { name: 'Office', value: 24 },
  { name: 'Food', value: 16 },
];

const MOCK_TREND_DATA = [
  { month: 'Jul', amount: 500 },
  { month: 'Aug', amount: 650 },
  { month: 'Sep', amount: 550 },
  { month: 'Oct', amount: 700 },
];

export const EmployeeDashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentUploads, setRecentUploads] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [expensesData, statsData, uploadsData] = await Promise.all([
          apiService.getExpenses(),
          apiService.getExpenseStats(),
          apiService.getRecentUploads()
        ]);

        if (expensesData.success) {
          setExpenses(expensesData.expenses);
        }
        if (statsData.success) {
          setStats(statsData);
        }
        if (uploadsData.success) {
          setRecentUploads(uploadsData.uploads);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <DashboardLayout
      role="Employee"
      user="John Doe"
      sidebarItems={employeeSidebarItems}
    >
      <div className="flex h-screen bg-gray-900">
        {/* Left Side - AI Assistant */}
        <div className="w-1/2 p-6 border-r border-gray-700">
          <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
            {/* AI Header */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-400 text-sm font-medium">Always online and ready to help</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Smart Auditor AI</h2>
              <p className="text-gray-400 text-sm">Online</p>
            </div>

            {/* Greeting */}
            <div className="mb-6">
              <p className="text-white text-lg">
                Hello! I'm Smart Auditor AI, your intelligent expense assistant. I can help you with:
              </p>
              <ul className="text-gray-300 text-sm mt-3 space-y-1">
                <li>• Analyzing expense patterns and trends</li>
                <li>• Explaining flagged transactions</li>
                <li>• Providing insights on spending optimization</li>
                <li>• Answering questions about your financial data</li>
                <li>• Recommending cost-saving opportunities</li>
              </ul>
              <p className="text-white text-lg mt-4">How can I assist you today?</p>
            </div>

            {/* Suggested Questions */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Suggested Questions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors">
                  Why was the Global Airlines transaction flagged?
                </button>
                <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors">
                  What are my top spending categories?
                </button>
                <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors">
                  How can I improve my expense integrity score?
                </button>
                <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors">
                  Explain the recent anomalies detected
                </button>
                <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors">
                  What cost-saving opportunities are available?
                </button>
              </div>
            </div>

            {/* AI Capabilities */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">AI Capabilities</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-white text-sm font-medium">Trend Analysis</h4>
                  <p className="text-gray-400 text-xs">Identify spending patterns</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-white text-sm font-medium">Anomaly Detection</h4>
                  <p className="text-gray-400 text-xs">Explain flagged transactions</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-white text-sm font-medium">Report Generation</h4>
                  <p className="text-gray-400 text-xs">Custom insights on demand</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-white text-sm font-medium">Smart Recommendations</h4>
                  <p className="text-gray-400 text-xs">Cost-saving opportunities</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-auto">
              <h3 className="text-white font-medium mb-3">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-white text-lg font-semibold">Response Time</p>
                  <p className="text-gray-400 text-sm">&lt; 2 sec</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-semibold">Accuracy Rate</p>
                  <p className="text-gray-400 text-sm">94.8%</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-semibold">Questions Answered</p>
                  <p className="text-gray-400 text-sm">this</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Dashboard Overview */}
        <div className="w-1/2 p-6">
          <div className="h-full overflow-y-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Expenses</p>
                    <p className="text-white text-2xl font-bold">
                      {loading ? '...' : stats ? `$${stats.total_amount.toFixed(2)}` : '$0.00'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-lg">💰</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Count</p>
                    <p className="text-white text-2xl font-bold">
                      {loading ? '...' : stats ? stats.total_expenses : 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400 text-lg">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending by Category Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : stats && Object.keys(stats.by_category).length > 0 ? (
                  Object.entries(stats.by_category).map(([category, amount], index) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
                    const color = colors[index % colors.length];
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 ${color} rounded`}></div>
                          <span className="text-gray-300">{category || 'Uncategorized'}</span>
                        </div>
                        <span className="text-white font-medium">${amount.toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400">No expense data available</p>
                )}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Uploads</h3>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-gray-400">Loading recent uploads...</p>
                ) : recentUploads.length > 0 ? (
                  recentUploads.slice(0, 3).map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium truncate">{upload.vendor || 'Unknown'}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            upload.anomalyStatus === 'flagged' 
                              ? 'bg-red-500/20 text-red-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {upload.anomalyStatus === 'flagged' ? '⚠️ Flagged' : '✓ Normal'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{upload.category} • {new Date(upload.uploadedAt).toLocaleDateString()}</p>
                        {upload.anomalyStatus === 'flagged' && upload.anomalyReason && (
                          <p className="text-yellow-400 text-xs mt-1 truncate">{upload.anomalyReason}</p>
                        )}
                      </div>
                      <span className="text-white font-bold ml-4">${upload.total.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No recent uploads yet</p>
                )}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Monthly Trend</h3>
              <div className="flex items-end justify-between h-32">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-500 w-8 rounded-t" style={{height: '60%'}}></div>
                  <span className="text-gray-400 text-xs mt-2">Oct</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-blue-500 w-8 rounded-t" style={{height: '80%'}}></div>
                  <span className="text-gray-400 text-xs mt-2">Nov</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};