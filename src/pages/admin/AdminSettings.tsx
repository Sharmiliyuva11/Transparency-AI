import { useState, useEffect } from "react";
import { apiService } from "../../services/api";

const tabs = [
  { key: "profile", label: "Profile" },
  { key: "organization", label: "Organization" },
  { key: "ai", label: "AI Settings" },
  { key: "notifications", label: "Notifications" }
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [modalLogoPath, setModalLogoPath] = useState('');
  const [settings, setSettings] = useState({
    profile: { displayName: '', email: '', department: '' },
    organization: { name: '', logo: '', logoPath: '', policy: '' },
    contact: { info: '' },
    help: { content: '' },
    ai: { anomaly: 'enabled', autoApprove: '', ocrProvider: '', apiKey: '', modelVersion: '', confidence: '' },
    notifications: {
      emailApproved: false,
      emailFlagged: false,
      emailNewUser: false,
      emailSummary: false,
      browserNotifications: false,
      soundAlerts: false
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiService.getSettings('admin');
      const data = response.settings;
      let logoPath = data.organisation.logoPath || '';
      if (logoPath && !logoPath.startsWith('http')) {
        logoPath = `http://127.0.0.1:5000/${logoPath}`;
      }
      setSettings({
        profile: {
          displayName: data.profile.displayName || '',
          email: data.profile.email || '',
          department: ''
        },
        organization: {
          name: data.organisation.name || '',
          logo: '',
          logoPath: logoPath,
          policy: ''
        },
        contact: {
          info: data.contact?.info || ''
        },
        help: {
          content: data.help?.content || ''
        },
        ai: {
          anomaly: data.ai.enabled ? 'enabled' : 'disabled',
          autoApprove: '',
          ocrProvider: '',
          apiKey: '',
          modelVersion: '',
          confidence: String(data.ai.accuracyThreshold) + '%'
        },
        notifications: {
          emailApproved: data.notifications.email,
          emailFlagged: data.notifications.expenseAlerts,
          emailNewUser: false,
          emailSummary: data.notifications.weeklyReports,
          browserNotifications: data.notifications.push,
          soundAlerts: false
        }
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const handleOrganizationChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      organization: { ...prev.organization, [field]: value }
    }));
  };

  const handleAIChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      ai: { ...prev.ai, [field]: value }
    }));
  };

  const handleNotificationChange = (field: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: checked }
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      uploadLogo(file);
    }
  };

  const openLogoModal = (logoPath: string) => {
    setModalLogoPath(logoPath);
    setShowLogoModal(true);
  };

  const closeLogoModal = () => {
    setShowLogoModal(false);
    setModalLogoPath('');
  };

  const uploadLogo = async (file: File) => {
    setSaving(true);
    try {
      const response = await apiService.uploadLogo('admin', file);
      setSettings(prev => ({
        ...prev,
        organization: { ...prev.organization, logoPath: response.logoPath }
      }));
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to upload logo';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Logo upload error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContactChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      contact: { info: value }
    }));
  };

  const handleHelpChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      help: { content: value }
    }));
  };

  const saveContactSettings = async () => {
    setSaving(true);
    try {
      await apiService.updateContact('admin', settings.contact.info);
      setMessage({ type: 'success', text: 'Contact information saved!' });
      await loadSettings();
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to save contact information';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Contact save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveHelpSettings = async () => {
    setSaving(true);
    try {
      await apiService.updateHelp('admin', settings.help.content);
      setMessage({ type: 'success', text: 'Help documentation saved!' });
      await loadSettings();
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to save help documentation';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Help save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveProfileSettings = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings('admin', {
        profile: {
          displayName: settings.profile.displayName,
          email: settings.profile.email
        }
      });
      setMessage({ type: 'success', text: 'Profile settings saved!' });
      await loadSettings();
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to save profile settings';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Profile save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveOrganizationSettings = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings('admin', {
        organisation: {
          name: settings.organization.name,
          industry: 'technology'
        }
      });
      setMessage({ type: 'success', text: 'Organization settings saved!' });
      await loadSettings();
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to save organization settings';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Organization save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveAISettings = async () => {
    setSaving(true);
    try {
      const confidenceMatch = settings.ai.confidence.match(/(\d+)/);
      const threshold = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

      await apiService.updateSettings('admin', {
        ai: {
          enabled: settings.ai.anomaly === 'enabled',
          responseTone: 'professional',
          accuracyThreshold: threshold
        }
      });
      setMessage({ type: 'success', text: 'AI settings saved!' });
      await loadSettings();
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to save AI settings';
      setMessage({ type: 'error', text: errorMsg });
      console.error('AI save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings('admin', {
        notifications: {
          email: settings.notifications.emailApproved,
          push: settings.notifications.browserNotifications,
          expenseAlerts: settings.notifications.emailFlagged,
          weeklyReports: settings.notifications.emailSummary
        }
      });
      setMessage({ type: 'success', text: 'Notification settings saved!' });
      await loadSettings();
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to save notification settings';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Notification save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-card">Loading settings...</div>;
  }

  return (
    <div className="settings-card">
      {message.text && (
        <div style={{
          padding: '10px 15px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}
      <div className="tab-strip">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button${activeTab === tab.key ? " active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "profile" && (
        <div className="tab-panel">
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="full-name">Full Name</label>
              <input 
                id="full-name" 
                className="input-field" 
                value={settings.profile.displayName}
                onChange={(e) => handleProfileChange('displayName', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="email">Email Address</label>
              <input 
                id="email" 
                className="input-field" 
                value={settings.profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="department">Department</label>
              <input 
                id="department" 
                className="input-field" 
                value={settings.profile.department}
                onChange={(e) => handleProfileChange('department', e.target.value)}
              />
            </div>
          </div>
          <button 
            className="primary-button" 
            style={{ width: 180 }}
            onClick={saveProfileSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
      {activeTab === "organization" && (
        <div className="tab-panel">
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="org-name">Organization Name</label>
              <input 
                id="org-name" 
                className="input-field" 
                value={settings.organization.name}
                onChange={(e) => handleOrganizationChange('name', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="org-logo">Organization Logo</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  id="org-logo" 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={saving}
                  style={{ display: 'none' }}
                />
                <button 
                  className="primary-button" 
                  style={{ width: 200 }}
                  onClick={() => document.getElementById('org-logo')?.click()}
                  disabled={saving}
                >
                  {saving ? 'Uploading...' : 'Upload New Logo'}
                </button>
                {settings.organization.logoPath && (
                  <img 
                    src={settings.organization.logoPath} 
                    alt="Logo preview" 
                    onClick={() => openLogoModal(settings.organization.logoPath)}
                    style={{ 
                      height: '40px', 
                      maxWidth: '150px',
                      cursor: 'pointer',
                      border: '1px solid #ddd',
                      padding: '2px',
                      borderRadius: '4px'
                    }} 
                    title="Click to view full size"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="settings-field">
            <label htmlFor="policy">Company Policy &amp; Guidelines</label>
            <textarea
              id="policy"
              className="textarea-field"
              value={settings.organization.policy}
              onChange={(e) => handleOrganizationChange('policy', e.target.value)}
            />
          </div>
          <button 
            className="primary-button" 
            style={{ width: 220 }}
            onClick={saveOrganizationSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Organization Settings'}
          </button>

          <div style={{ marginTop: '30px', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Contact Information</h3>
            <div className="settings-field">
              <label htmlFor="contact">Support Contact Details</label>
              <textarea
                id="contact"
                className="textarea-field"
                value={settings.contact.info}
                onChange={(e) => handleContactChange(e.target.value)}
                placeholder="Enter contact email, phone, or address..."
              />
            </div>
            <button 
              className="primary-button" 
              style={{ width: 200 }}
              onClick={saveContactSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Contact Information'}
            </button>
          </div>

          <div style={{ marginTop: '30px', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Help &amp; Documentation</h3>
            <div className="settings-field">
              <label htmlFor="help">Help Content</label>
              <textarea
                id="help"
                className="textarea-field"
                value={settings.help.content}
                onChange={(e) => handleHelpChange(e.target.value)}
                placeholder="Enter help documentation or frequently asked questions..."
                style={{ minHeight: '150px' }}
              />
            </div>
            <button 
              className="primary-button" 
              style={{ width: 200 }}
              onClick={saveHelpSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Help Documentation'}
            </button>
          </div>
        </div>
      )}
      {activeTab === "ai" && (
        <div className="tab-panel">
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="anomaly">Enable Anomaly Detection</label>
              <select 
                id="anomaly" 
                className="input-field" 
                value={settings.ai.anomaly}
                onChange={(e) => handleAIChange('anomaly', e.target.value)}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="settings-field">
              <label htmlFor="auto-approve">Auto-approval Threshold</label>
              <input 
                id="auto-approve" 
                className="input-field" 
                value={settings.ai.autoApprove}
                onChange={(e) => handleAIChange('autoApprove', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="ocr-provider">OCR Provider</label>
              <input 
                id="ocr-provider" 
                className="input-field" 
                value={settings.ai.ocrProvider}
                onChange={(e) => handleAIChange('ocrProvider', e.target.value)}
              />
            </div>
          </div>
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="api-key">API Key</label>
              <input 
                id="api-key" 
                className="input-field" 
                value={settings.ai.apiKey}
                onChange={(e) => handleAIChange('apiKey', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="model-version">Model Version</label>
              <input 
                id="model-version" 
                className="input-field" 
                value={settings.ai.modelVersion}
                onChange={(e) => handleAIChange('modelVersion', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="confidence">Confidence Threshold</label>
              <input 
                id="confidence" 
                className="input-field" 
                value={settings.ai.confidence}
                onChange={(e) => handleAIChange('confidence', e.target.value)}
              />
            </div>
          </div>
          <button 
            className="primary-button" 
            style={{ width: 180 }}
            onClick={saveAISettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save AI Settings'}
          </button>
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="tab-panel">
          <div className="settings-grid">
            <div className="settings-field">
              <label>Email Notifications</label>
              <div className="toggle-column">
                <label><input 
                  type="checkbox" 
                  checked={settings.notifications.emailApproved}
                  onChange={(e) => handleNotificationChange('emailApproved', e.target.checked)}
                /> Expense approved</label>
                <label><input 
                  type="checkbox" 
                  checked={settings.notifications.emailFlagged}
                  onChange={(e) => handleNotificationChange('emailFlagged', e.target.checked)}
                /> Expense flagged by AI</label>
                <label><input 
                  type="checkbox" 
                  checked={settings.notifications.emailNewUser}
                  onChange={(e) => handleNotificationChange('emailNewUser', e.target.checked)}
                /> New user added</label>
                <label><input 
                  type="checkbox" 
                  checked={settings.notifications.emailSummary}
                  onChange={(e) => handleNotificationChange('emailSummary', e.target.checked)}
                /> Weekly summary report</label>
              </div>
            </div>
            <div className="settings-field">
              <label>In-App Notifications</label>
              <div className="toggle-column">
                <label><input 
                  type="checkbox" 
                  checked={settings.notifications.browserNotifications}
                  onChange={(e) => handleNotificationChange('browserNotifications', e.target.checked)}
                /> Browser notifications</label>
                <label><input 
                  type="checkbox" 
                  checked={settings.notifications.soundAlerts}
                  onChange={(e) => handleNotificationChange('soundAlerts', e.target.checked)}
                /> Sound alerts</label>
              </div>
            </div>
          </div>
          <button 
            className="primary-button" 
            style={{ width: 220 }}
            onClick={saveNotificationSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      )}

      {showLogoModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={closeLogoModal}
        >
          <div 
            style={{
              position: 'relative',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '90%',
              maxHeight: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLogoModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              X
            </button>
            <img 
              src={modalLogoPath} 
              alt="Logo full view" 
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                display: 'block'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}