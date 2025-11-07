import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Chart } from '../components/Chart';
import { ExpenseTable } from '../components/ExpenseTable';

const MOCK_EXPENSES = [
  { 
    id: '1', 
    date: '2025-11-01', 
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
    category: 'Office', 
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

const MOCK_COMPLIANCE_DATA = [
  { name: 'Compliant', value: 94 },
  { name: 'Non-Compliant', value: 6 },
];

const MOCK_AUDIT_STATS = [
  { month: 'Jul', percentage: 92 },
  { month: 'Aug', percentage: 94 },
  { month: 'Sep', percentage: 93 },
  { month: 'Oct', percentage: 94 },
];

export const AuditorDashboard: React.FC = () => {
  const handleApprove = (id: string) => {
    console.log('Approved:', id);
  };

  const handleReject = (id: string) => {
    console.log('Rejected:', id);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Auditor Dashboard</h1>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Inspections"
            value="172"
            trend={5}
            color="blue"
          />
          <StatCard
            title="Compliance Rate"
            value="90.7%"
            trend={2.3}
            color="green"
          />
          <StatCard
            title="Flagged Expenses"
            value="16"
            trend={-3}
            color="red"
          />
          <StatCard
            title="Policy Deviations"
            value="8"
            trend={-1}
            color="yellow"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Compliance Overview</h2>
            <Chart data={MOCK_COMPLIANCE_DATA} type="pie" dataKey="value" height={300} />
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Audit Review Statistics</h2>
            <Chart 
              data={MOCK_AUDIT_STATS} 
              type="line" 
              dataKey="percentage" 
              xAxisKey="month" 
              height={300} 
            />
          </div>
        </div>

        {/* Expenses Under Review */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Expenses Under Review</h2>
          <ExpenseTable 
            expenses={MOCK_EXPENSES} 
            showActions={true}
            showUser={true}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Documentation Quality</h3>
            <p className="text-2xl font-semibold text-white">92.5%</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">AI Accuracy</h3>
            <p className="text-2xl font-semibold text-white">94.8%</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Avg Resolution Time</h3>
            <p className="text-2xl font-semibold text-white">2.5 days</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};