import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Chart } from '../components/Chart';
import { ExpenseTable } from '../components/ExpenseTable';

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
  const handleApprove = (id: string) => {
    console.log('Approved:', id);
  };

  const handleReject = (id: string) => {
    console.log('Rejected:', id);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Organization Overview</h1>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Organization Expenses"
            value="$50,000"
            trend={12.5}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value="6"
            color="green"
          />
          <StatCard
            title="Pending Review"
            value="8"
            color="yellow"
          />
          <StatCard
            title="AI Accuracy"
            value="94.8%"
            trend={1.2}
            color="blue"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Department-wise Spending</h2>
            <Chart 
              data={MOCK_DEPARTMENT_DATA} 
              type="line" 
              dataKey="amount" 
              xAxisKey="name" 
              height={300} 
            />
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Monthly Expense Trend</h2>
            <Chart 
              data={MOCK_TREND_DATA} 
              type="line" 
              dataKey="amount" 
              xAxisKey="month" 
              height={300} 
            />
          </div>
        </div>

        {/* Pending Review Expenses */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4">All Organization Expenses - Pending Review</h2>
          <ExpenseTable 
            expenses={MOCK_EXPENSES} 
            showActions={true}
            showUser={true}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            <h3 className="text-lg font-medium text-white mb-2">Manage Users</h3>
            <p className="text-sm text-gray-400">Add or remove organization members</p>
          </button>
          <button className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            <h3 className="text-lg font-medium text-white mb-2">Analytics</h3>
            <p className="text-sm text-gray-400">View detailed spending insights</p>
          </button>
          <button className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            <h3 className="text-lg font-medium text-white mb-2">Export Reports</h3>
            <p className="text-sm text-gray-400">Download audit and compliance reports</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};