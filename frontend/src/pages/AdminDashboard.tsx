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



export const AdminDashboard: React.FC = () => {

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
        {/* Settings */}
        <div className="w-full p-6">
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