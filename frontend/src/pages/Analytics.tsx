import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiService } from '../services/api';

interface ReportData {
  totalExpenses: number;
  complianceRate: number;
  averagePerTransaction: number;
  flaggedItems: number;
  expenseTrendData: Array<{ month: string; amount: number }>;
  aiInsights: Array<{ id: string; type: string; severity: string; message: string }>;
}

export const Analytics: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminReports();
      setReportData(response);
      setError('');
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 bg-red-900 text-red-200 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Success':
        return 'bg-green-900 text-green-200';
      case 'Alert':
        return 'bg-red-900 text-red-200';
      case 'Warning':
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-blue-900 text-blue-200';
    }
  };

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Analytics & Reports</h1>

        {reportData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Total Expenses</h3>
                <p className="text-3xl font-bold text-white">${reportData.totalExpenses.toLocaleString()}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Compliance Rate</h3>
                <p className="text-3xl font-bold text-white">{reportData.complianceRate.toFixed(1)}%</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Avg Per Transaction</h3>
                <p className="text-3xl font-bold text-white">${reportData.averagePerTransaction.toFixed(2)}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Flagged Items</h3>
                <p className="text-3xl font-bold text-red-400">{reportData.flaggedItems}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-bold text-white mb-4">Expense Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.expenseTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3B82F6" 
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-bold text-white mb-4">Monthly Comparison</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.expenseTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4">AI Insights</h2>
              <div className="space-y-3">
                {reportData.aiInsights.length === 0 ? (
                  <p className="text-gray-400">No insights available</p>
                ) : (
                  reportData.aiInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg ${getSeverityColor(insight.severity)}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{insight.type}</p>
                          <p className="text-sm mt-1">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
