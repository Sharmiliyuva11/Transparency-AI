// Mock data for reports page

// Type definitions
export interface ReportsProps {
  totalExpenses: number;
  complianceRate: number;
  averagePerTransaction: number;
  flaggedItems: number;
  expenseTrendData: ExpenseTrendPoint[];
  categorySpendingData: CategorySpending[];
  aiInsights: AIInsight[];
}

export interface ExpenseTrendPoint {
  month: string;
  amount: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
}

export interface AIInsight {
  id: string;
  type: "Spending Insight" | "Anomaly Alert" | "Compliance Status" | "Recommendation";
  severity: "Info" | "Alert" | "Success" | "Warning";
  message: string;
}

export const mockReportsProps: ReportsProps = {
  totalExpenses: 11200,
  complianceRate: 97.7,
  averagePerTransaction: 172,
  flaggedItems: 23,
  
  expenseTrendData: [
    { month: "Jan", amount: 8500 },
    { month: "Feb", amount: 9200 },
    { month: "Mar", amount: 7800 },
    { month: "Apr", amount: 10500 },
    { month: "May", amount: 9800 },
    { month: "Jun", amount: 11200 },
    { month: "Jul", amount: 10800 },
    { month: "Aug", amount: 12500 },
    { month: "Sep", amount: 11800 },
    { month: "Oct", amount: 13200 }
  ],
  
  categorySpendingData: [
    { category: "Travel", amount: 16000 },
    { category: "Food", amount: 5500 },
    { category: "Office", amount: 8200 },
    { category: "Misc", amount: 3800 }
  ],
  
  aiInsights: [
    {
      id: "insight-1",
      type: "Spending Insight" as const,
      severity: "Info" as const,
      message: "Your travel expenses have increased by 15% compared to last quarter. Consider reviewing vendor contracts for cost optimization."
    },
    {
      id: "insight-2",
      type: "Anomaly Alert" as const,
      severity: "Alert" as const,
      message: "Detected 3 unusual transactions in the Office Supplies category totaling $2,450. Manual review recommended for compliance verification."
    },
    {
      id: "insight-3",
      type: "Compliance Status" as const,
      severity: "Success" as const,
      message: "97.3% of submitted expenses meet compliance standards. 5 items flagged for policy violations requiring immediate attention."
    },
    {
      id: "insight-4",
      type: "Recommendation" as const,
      severity: "Warning" as const,
      message: "Based on spending patterns, switching to preferred vendors could save approximately $3,200 monthly across departments."
    }
  ]
};