// Mock data for anomaly detection page

// Type definitions
export interface AnomalyDetectionProps {
  totalCharges: number;
  anomalousTransactions: number;
  averageDeviation: number;
  detectionAccuracy: number;
  modulationData: ModulationDataPoint[];
  anomalyReasonDistribution: AnomalyReasonData[];
  flaggedTransactions: FlaggedTransaction[];
  recentFlags: RecentFlag[];
}

export interface ModulationDataPoint {
  month: string;
  value: number;
}

export interface AnomalyReasonData {
  name: string;
  value: number;
  color: string;
}

export interface FlaggedTransaction {
  id: string;
  dateTime: Date;
  vendorName: string;
  category: "Food & Dining" | "Office Supplies" | "Equipment" | "Services" | "Travel";
  amount: number;
  anomalyType: "Unusual Amount" | "Duplicate Detection" | "Unusual Vendor" | "Unknown Vendor";
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
}

export interface RecentFlag {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  summary: string;
  details: string;
  timestamp: Date;
}

export const mockRootProps: AnomalyDetectionProps = {
  totalCharges: 12500.00,
  anomalousTransactions: 12,
  averageDeviation: 342.50,
  detectionAccuracy: 94.8,
  
  modulationData: [
    { month: "Jan", value: 8 },
    { month: "Feb", value: 12 },
    { month: "Mar", value: 15 },
    { month: "Apr", value: 11 },
    { month: "May", value: 9 },
    { month: "Jun", value: 14 },
    { month: "Jul", value: 13 },
    { month: "Aug", value: 10 },
    { month: "Sep", value: 16 },
    { month: "Oct", value: 12 }
  ],
  
  anomalyReasonDistribution: [
    { name: "Unusual Amount", value: 35, color: "#ff6b6b" },
    { name: "Duplicate Detection", value: 25, color: "#ffa94d" },
    { name: "Unusual Vendor", value: 25, color: "#ffd93d" },
    { name: "Unknown Vendor", value: 15, color: "#6bcf7f" }
  ],
  
  flaggedTransactions: [
    {
      id: "txn-1",
      dateTime: new Date("2025-01-15T14:30:00"),
      vendorName: "Metro Diner",
      category: "Food & Dining" as const,
      amount: 2450,
      anomalyType: "Unusual Amount" as const,
      severity: "Critical" as const,
      confidence: 95
    },
    {
      id: "txn-2",
      dateTime: new Date("2025-01-14T09:15:00"),
      vendorName: "Quick Services",
      category: "Office Supplies" as const,
      amount: 1200,
      anomalyType: "Duplicate Detection" as const,
      severity: "High" as const,
      confidence: 88
    },
    {
      id: "txn-3",
      dateTime: new Date("2025-01-13T16:45:00"),
      vendorName: "Tech Warehouse",
      category: "Equipment" as const,
      amount: 3200,
      anomalyType: "Unusual Vendor" as const,
      severity: "Medium" as const,
      confidence: 72
    },
    {
      id: "txn-4",
      dateTime: new Date("2025-01-12T11:20:00"),
      vendorName: "Office Depot",
      category: "Office Supplies" as const,
      amount: 850,
      anomalyType: "Unusual Amount" as const,
      severity: "Low" as const,
      confidence: 65
    },
    {
      id: "txn-5",
      dateTime: new Date("2025-01-11T13:00:00"),
      vendorName: "Acme Corp",
      category: "Services" as const,
      amount: 500,
      anomalyType: "Unknown Vendor" as const,
      severity: "High" as const,
      confidence: 91
    }
  ],
  
  recentFlags: [
    {
      id: "flag-1",
      severity: "Critical" as const,
      title: "Unusual Amount",
      summary: "Duplicate Receipt Detected: The receipt amount for $2,500 was submitted on 01/15/25. Our AI found a potential duplicate for the same day by the same vendor. Flagged as potential duplicate.",
      details: "Our AI has flagged this receipt as a potential duplicate. The receipt amount for $2,500 was submitted on 01/15/25. We detected a previous transaction with the same vendor on the same day for a similar amount. This pattern suggests a possible duplicate submission.",
      timestamp: new Date("2025-01-15T14:30:00")
    },
    {
      id: "flag-2",
      severity: "High" as const,
      title: "SQL Test Service",
      summary: "Unusual Vendor Activity: SQL Test Service has been flagged for unusual transaction patterns. This vendor is not in our approved vendor list and the transaction amount of $1,200 exceeds typical thresholds.",
      details: "The AI system has identified SQL Test Service as an unusual vendor. This vendor is not present in the approved vendor database, and the transaction amount significantly deviates from normal spending patterns for similar categories.",
      timestamp: new Date("2025-01-14T09:15:00")
    },
    {
      id: "flag-3",
      severity: "Medium" as const,
      title: "Unknown Vendor CSV",
      summary: "Unknown Vendor: An expense was submitted for a vendor labeled 'Unknown Vendor CSV'. The AI system cannot verify this vendor and recommends manual review before approval.",
      details: "A transaction has been flagged due to an unrecognized vendor name. The system's vendor verification algorithm could not match this entry with any known or approved vendors in the database. Manual verification is recommended.",
      timestamp: new Date("2025-01-13T16:45:00")
    }
  ]
};