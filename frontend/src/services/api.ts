// API service for communicating with the backend
const API_BASE_URL = 'http://127.0.0.1:5000';

export interface Expense {
  id: number;
  file: string;
  uploadedAt: string;
  category: string;
  vendor: string;
  total: number;
  textPreview: string;
  status: string;
  anomalyStatus?: string;
  anomalyReason?: string;
}

export interface ExpenseStats {
  success: boolean;
  total_expenses: number;
  total_amount: number;
  by_category: Record<string, number>;
  category_percentages: Record<string, number>;
}

export interface AnomalyStats {
  flagged_count: number;
  normal_count: number;
  flagged_percentage: number;
}

export interface ExpensesByCategory {
  success: boolean;
  by_category: Record<string, {
    total: number;
    count: number;
    expenses: Expense[];
  }>;
}

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
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getExpenses(): Promise<{ success: boolean; expenses: Expense[]; count: number }> {
    return this.request('/expenses');
  }

  async getExpenseStats(): Promise<ExpenseStats> {
    return this.request('/expenses/stats');
  }

  async getExpensesByCategory(): Promise<ExpensesByCategory> {
    return this.request('/expenses/by-category');
  }

  async getRecentUploads(): Promise<{ success: boolean; uploads: Expense[] }> {
    return this.request('/recent-uploads');
  }

  async getAnomalies(): Promise<{ success: boolean; anomalies: Expense[]; stats: AnomalyStats }> {
    return this.request('/anomalies');
  }

  async recheckAnomaly(expenseId: number): Promise<{ success: boolean; expense: Expense; anomalyStatus: string; anomalyReason: string }> {
    return this.request(`/anomalies/recheck/${expenseId}`, 'POST');
  }

  async getSettings(role: string): Promise<{ success: boolean; settings: UserSettings }> {
    return this.request(`/settings/${role}`);
  }

  async updateSettings(role: string, settings: Partial<UserSettings>): Promise<{ success: boolean; settings: UserSettings }> {
    return this.request(`/settings/${role}`, 'PUT', settings);
  }

  async getAdminUsers(): Promise<{ success: boolean; users: Array<{ id: string; name: string; email: string; department: string; role: string; status: string; joinedDate: string }>; adminUsersCount: number; staffEmployeesCount: number; auditorsCount: number }> {
    return this.request('/api/admin/users');
  }

  async createUser(userData: { name: string; email: string; department: string; organization: string }): Promise<{ success: boolean; message: string; user: { id: string; name: string; email: string; department: string; role: string; status: string; joinedDate: string } }> {
    return this.request('/api/admin/users', 'POST', userData);
  }

  async updateUser(userId: string, userData: { name?: string; email?: string; department?: string }): Promise<{ success: boolean; message: string; user: { id: string; name: string; email: string; department: string; role: string; status: string; joinedDate: string } }> {
    return this.request(`/api/admin/users/${userId}`, 'PUT', userData);
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/admin/users/${userId}`, 'DELETE');
  }

  async getAdminReports(): Promise<{ success: boolean; totalExpenses: number; complianceRate: number; averagePerTransaction: number; flaggedItems: number; expenseTrendData: Array<{ month: string; amount: number }>; aiInsights: Array<{ id: string; type: string; severity: string; message: string }> }> {
    return this.request('/api/admin/reports');
  }
}

export const apiService = new ApiService();