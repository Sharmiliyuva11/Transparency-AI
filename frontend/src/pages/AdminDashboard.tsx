import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { FiHome, FiUsers, FiBarChart, FiSettings, FiAlertTriangle } from 'react-icons/fi';
import { apiService, type UserSettings } from '../services/api';
import type { SidebarItem } from '../components/DashboardLayout';
import { AnomalyDetectionPage } from './AnomalyDetectionPage';
import { UserManagement } from './UserManagement';
import { Analytics } from './Analytics';

const adminSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: <FiHome />, active: true },
  { label: 'Anomaly Detection', icon: <FiAlertTriangle /> },
  { label: 'User Management', icon: <FiUsers /> },
  { label: 'Analytics', icon: <FiBarChart /> },
  { label: 'Settings', icon: <FiSettings /> },
];

const MOCK_EXPENSES = [
  { 
    id: '1', 
    date: '2025-10-28', 
    user: 'Sarah Johnson',
    vendor: 'Global Airlines', 
    amount: 5900, 
    category: 'Travel', 
    status: 'flagged' as const
  },
  { 
    id: '2', 
    date: '2025-10-25', 
    user: 'Emily Davis',
    vendor: 'Restaurant Plaza', 
    amount: 450, 
    category: 'Food', 
    status: 'pending' as const
  },
  { 
    id: '3', 
    date: '2025-10-20', 
    user: 'Emily Davis',
    vendor: 'ABC Tax Service', 
    amount: 2500, 
    category: 'Travel', 
    status: 'flagged' as const
  },
  { 
    id: '4', 
    date: '2025-10-15', 
    user: 'Mike Chan',
    vendor: 'Conference Center', 
    amount: 3500, 
    category: 'Misc', 
    status: 'pending' as const
  },
];

const MOCK_DEPARTMENT_DATA = [
  { name: 'Engineering', amount: 15000 },
  { name: 'Marketing', amount: 12000 },
  { name: 'Sales', amount: 9000 },
  { name: 'Operations', amount: 7000 },
  { name: 'HR', amount: 5000 },
];

const MOCK_TREND_DATA = [
  { month: 'May', amount: 30000 },
  { month: 'Jun', amount: 35000 },
  { month: 'Jul', amount: 32000 },
  { month: 'Aug', amount: 40000 },
  { month: 'Sep', amount: 38000 },
  { month: 'Oct', amount: 37000 },
];

export const AdminDashboard: React.FC = () => {
  void MOCK_EXPENSES;
  void MOCK_DEPARTMENT_DATA;
  void MOCK_TREND_DATA;

  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiService.getSettings('admin');
        setSettings(response.settings);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleProfileChange = (field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      profile: { ...settings.profile, [field]: value }
    });
  };

  const handleOrganisationChange = (field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      organisation: { ...settings.organisation, [field]: value }
    });
  };

  const handleAIChange = (field: string, value: string | number | boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      ai: { ...settings.ai, [field]: value }
    });
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [field]: value }
    });
  };

  const handlePreferencesChange = (field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      preferences: { ...settings.preferences, [field]: value }
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiService.updateSettings('admin', settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSidebarClick = (label: string) => {
    setActivePage(label);
  };

  const renderActivePageContent = (): React.ReactNode => {
    switch (activePage) {
      case 'Anomaly Detection':
        return <AnomalyDetectionPage />;
      case 'User Management':
        return <UserManagement />;
      case 'Analytics':
        return <Analytics />;
      case 'Dashboard':
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = (): React.ReactNode => {
    return (
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

        {/* Right Side - Settings */}
        <div className="w-1/2 p-6">
          <div className="bg-gray-800 rounded-lg p-6 h-full overflow-y-auto">
            <h1 className="text-2xl font-semibold text-white mb-6">Settings</h1>

            {message.text && (
              <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                {message.text}
              </div>
            )}

            {/* Profile Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-4">User Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={settings?.profile.displayName || ''}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings?.profile.email || ''}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Organization Settings */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={settings?.organisation.name || ''}
                    onChange={(e) => handleOrganisationChange('name', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Industry</label>
                  <select 
                    value={settings?.organisation.industry || ''}
                    onChange={(e) => handleOrganisationChange('industry', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-4">AI Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Response Tone</label>
                  <select 
                    value={settings?.ai.responseTone || 'professional'}
                    onChange={(e) => handleAIChange('responseTone', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">AI Accuracy Threshold</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="80"
                      max="100"
                      value={settings?.ai.accuracyThreshold || 95}
                      onChange={(e) => handleAIChange('accuracyThreshold', parseInt(e.target.value))}
                      className="flex-1 bg-gray-700 rounded-lg"
                    />
                    <span className="text-white w-12 text-right">{settings?.ai.accuracyThreshold || 95}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Enable AI</h3>
                    <p className="text-gray-400 text-sm">Enable AI-powered features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings?.ai.enabled || false}
                      onChange={(e) => handleAIChange('enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Email Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings?.notifications.email || false}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Push Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings?.notifications.push || false}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Expense Alerts</h3>
                    <p className="text-gray-400 text-sm">Get notified of suspicious transactions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings?.notifications.expenseAlerts || false}
                      onChange={(e) => handleNotificationChange('expenseAlerts', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Weekly Reports</h3>
                    <p className="text-gray-400 text-sm">Receive weekly expense summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings?.notifications.weeklyReports || false}
                      onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Theme Preferences */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-4">App Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Theme</label>
                  <select 
                    value={settings?.preferences.theme || 'dark'}
                    onChange={(e) => handlePreferencesChange('theme', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mb-8 pt-4 border-t border-gray-700">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && activePage === 'Dashboard') {
    return (
      <DashboardLayout 
        role="Admin" 
        user="Mike Johnson" 
        sidebarItems={adminSidebarItems}
        onSidebarClick={handleSidebarClick}
      >
        <div className="flex items-center justify-center h-screen">
          <p className="text-white">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  const updatedSidebarItems = adminSidebarItems.map(item => ({
    ...item,
    active: item.label === activePage
  }));

  return (
    <DashboardLayout
      role="Admin"
      user="Mike Johnson"
      sidebarItems={updatedSidebarItems}
      onSidebarClick={handleSidebarClick}
    >
      {renderActivePageContent()}
    </DashboardLayout>
  );
};