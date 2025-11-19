import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { apiService, type Expense, type AnomalyStats } from '../services/api';

export const AnomalyDetectionPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Expense[]>([]);
  const [stats, setStats] = useState<AnomalyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recheckingId, setRecheckingId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadAnomalies = async () => {
    try {
      setError(null);
      const response = await apiService.getAnomalies();
      if (response.success) {
        setAnomalies(response.anomalies);
        setStats(response.stats);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError('Failed to load anomalies');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load anomalies');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAnomalies();
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadAnomalies();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleRecheck = async (expenseId: number) => {
    try {
      setRecheckingId(expenseId);
      const response = await apiService.recheckAnomaly(expenseId);
      if (response.success) {
        setAnomalies(anomalies.filter(a => a.id !== expenseId));
        if (response.expense.anomalyStatus === 'flagged') {
          setAnomalies([response.expense, ...anomalies.filter(a => a.id !== expenseId)]);
        }
        await loadAnomalies();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recheck anomaly');
    } finally {
      setRecheckingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="text-center text-white">Loading anomalies...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Anomaly Detection</h1>
            <p className="text-gray-400">Monitor and manage flagged transactions</p>
            {lastUpdated && (
              <p className="text-gray-500 text-sm mt-2">Last updated: {lastUpdated}</p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} size={18} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Expenses</p>
                <p className="text-white text-3xl font-bold">
                  {stats && stats.normal_count + stats.flagged_count}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Normal Transactions</p>
                <p className="text-green-400 text-3xl font-bold">
                  {stats?.normal_count}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="text-green-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Flagged Transactions</p>
                <p className="text-red-400 text-3xl font-bold">
                  {stats?.flagged_count}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <FiAlertTriangle className="text-red-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Flagged Transactions */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FiAlertTriangle className="mr-2 text-red-400" />
              Flagged Transactions ({anomalies.length})
            </h2>
          </div>

          {anomalies.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No flagged transactions detected. All expenses look normal!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">File</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Vendor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">Amount</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Reason</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((expense, index) => (
                    <tr
                      key={expense.id}
                      className={`border-b border-gray-700 ${
                        index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'
                      } hover:bg-gray-700/50 transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm text-white font-medium truncate">
                        {expense.file}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {expense.vendor || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-white font-semibold">
                        ${expense.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-semibold">
                          ⚠️ Flagged
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-yellow-400 max-w-xs truncate" title={expense.anomalyReason}>
                        {expense.anomalyReason || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(expense.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRecheck(expense.id)}
                          disabled={recheckingId === expense.id}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
                        >
                          {recheckingId === expense.id ? (
                            <>
                              <FiRefreshCw className="animate-spin" />
                              Rechecking...
                            </>
                          ) : (
                            <>
                              <FiRefreshCw size={14} />
                              Recheck
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Anomaly Detection Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg p-6 border border-blue-700">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Detection Criteria</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>• Amount significantly exceeds category average</li>
              <li>• High transaction amount (&gt; $5000)</li>
              <li>• First transaction with new vendor</li>
              <li>• Potential duplicate transactions</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-6 border border-green-700">
            <h3 className="text-lg font-semibold text-green-300 mb-3">Integrity Score</h3>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-green-400">
                {stats ? Math.round(100 - stats.flagged_percentage) : 0}%
              </div>
              <div className="text-green-200 mb-1">Excellent expense integrity</div>
            </div>
            <p className="text-xs text-green-300 mt-2">
              {stats?.flagged_count} anomalies out of {stats && stats.normal_count + stats.flagged_count} total expenses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
