import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const SettingsDebug: React.FC = () => {
  const [status, setStatus] = useState<string[]>([]);

  const addStatus = (msg: string) => {
    setStatus(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const testAPI = async () => {
    addStatus('Testing Settings API...');
    
    try {
      addStatus('1. Attempting to fetch admin settings...');
      const getResponse = await apiService.getSettings('admin');
      addStatus(`✓ GET Success: ${JSON.stringify(getResponse.settings.profile)}`);
      
      addStatus('2. Attempting to update settings...');
      const updateData = {
        profile: {
          displayName: 'Test Admin ' + new Date().getTime(),
          email: 'test@example.com'
        }
      };
      const putResponse = await apiService.updateSettings('admin', updateData);
      addStatus(`✓ PUT Success: ${JSON.stringify(putResponse.settings.profile)}`);
      
      addStatus('3. Verifying update with new GET...');
      const verifyResponse = await apiService.getSettings('admin');
      addStatus(`✓ VERIFY Success: ${JSON.stringify(verifyResponse.settings.profile)}`);
      
      addStatus('✓ All tests passed!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        addStatus(`✗ Error: ${error.message}`);
      } else {
        addStatus(`✗ Unknown error`);
      }
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
      <h1>Settings API Debug</h1>
      <button 
        onClick={testAPI}
        style={{ padding: '10px 20px', marginBottom: '20px', cursor: 'pointer' }}
      >
        Run Test
      </button>
      <div style={{ 
        backgroundColor: '#222', 
        padding: '10px', 
        borderRadius: '5px',
        border: '1px solid #444',
        maxHeight: '600px',
        overflow: 'auto'
      }}>
        {status.map((msg, idx) => (
          <div key={idx} style={{ padding: '5px 0', fontSize: '12px' }}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};
