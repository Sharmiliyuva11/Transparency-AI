import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Chart } from '../components/Chart';
import { ExpenseTable } from '../components/ExpenseTable';

import { FiHome, FiUpload, FiList, FiSettings } from 'react-icons/fi';
import type { SidebarItem } from '../components/DashboardLayout';

const employeeSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: <FiHome />, active: true },
  { label: 'Upload Receipt', icon: <FiUpload /> },
  { label: 'My Expenses', icon: <FiList /> },
  { label: 'Settings', icon: <FiSettings /> },
];

const MOCK_EXPENSES = [
  { id: '1', date: '2025-11-01', vendor: 'Coffee Shop', amount: 45, category: 'Food', status: 'approved' },
  { id: '2', date: '2025-10-30', vendor: 'Uber', amount: 28, category: 'Travel', status: 'approved' },
  { id: '3', date: '2025-10-28', vendor: 'Office Depot', amount: 120, category: 'Office', status: 'pending' },
  { id: '4', date: '2025-10-25', vendor: 'Hotel XYZ', amount: 450, category: 'Travel', status: 'flagged' },
  { id: '5', date: '2025-10-22', vendor: 'Restaurant', amount: 85, category: 'Food', status: 'approved' },
];

const MOCK_CATEGORY_DATA = [
  { name: 'Travel', value: 60 },
  { name: 'Office', value: 24 },
  { name: 'Food', value: 16 },
];

const MOCK_TREND_DATA = [
  { month: 'Jul', amount: 500 },
  { month: 'Aug', amount: 650 },
  { month: 'Sep', amount: 550 },
  { month: 'Oct', amount: 700 },
];

export const EmployeeDashboard: React.FC = () => {
  return (
    <DashboardLayout
      role="Employee"
      user="John Doe"
      sidebarItems={employeeSidebarItems}
    >
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">My Expense Dashboard</h1>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="My Total Expenses"
            value="$728"
            color="blue"
          />
          <StatCard
            title="Receipts Uploaded"
            value="5"
            color="green"
          />
          <StatCard
            title="Pending Review"
            value="1"
            color="yellow"
          />
          <StatCard
            title="Flagged Items"
            value="1"
            color="red"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">My Spending by Category</h2>
            <Chart data={MOCK_CATEGORY_DATA} type="pie" dataKey="value" height={300} />
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">My Monthly Spending Trend</h2>
            <Chart 
              data={MOCK_TREND_DATA} 
              type="line" 
              dataKey="amount" 
              xAxisKey="month" 
              height={300} 
            />
          </div>
        </div>

        {/* Recent Expenses Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">My Recent Expenses</h2>
          <ExpenseTable expenses={MOCK_EXPENSES} />
        </div>
      </div>
    </DashboardLayout>
  );
};