const API_BASE_URL = 'http://127.0.0.1:5000';

export interface UserSettings {
  id: number;
  role: string;
  userId: string;
  profile: {
    displayName: string;
    email: string;
  };
  organisation: {
    name: string;
    industry: string;
    logoPath?: string;
  };
  contact?: {
    info?: string;
  };
  help?: {
    content?: string;
  };
  ai: {
    enabled: boolean;
    responseTone: string;
    accuracyThreshold: number;
  };
  notifications: {
    email: boolean;
    push: boolean;
    expenseAlerts: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    theme: string;
  };
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private async request<T>(endpoint: string, method: string = 'GET', body?: unknown): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', { status: response.status, data });
        throw new Error(data?.error || `API request failed: ${response.statusText}`);
      }
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  private async uploadFile(endpoint: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Upload Error Response:', { status: response.status, data });
        throw new Error(data?.error || `Upload failed: ${response.statusText}`);
      }
      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  async getSettings(role: string): Promise<{ success: boolean; settings: UserSettings }> {
    return this.request(`/settings/${role}`);
  }

  async updateSettings(role: string, settings: Partial<UserSettings>): Promise<{ success: boolean; settings: UserSettings }> {
    return this.request(`/settings/${role}`, 'PUT', settings);
  }

  async uploadLogo(role: string, file: File): Promise<{ success: boolean; logoPath: string; settings: UserSettings }> {
    const response = await this.uploadFile(`/settings/${role}/upload-logo`, file);
    if (response.logoPath && !response.logoPath.startsWith('http')) {
      response.logoPath = `${API_BASE_URL}/${response.logoPath}`;
    }
    return response;
  }

  async updateContact(role: string, contactInfo: string): Promise<{ success: boolean; settings: UserSettings }> {
    return this.updateSettings(role, { contact: { info: contactInfo } });
  }

  async updateHelp(role: string, helpContent: string): Promise<{ success: boolean; settings: UserSettings }> {
    return this.updateSettings(role, { help: { content: helpContent } });
  }
}

export const apiService = new ApiService();
