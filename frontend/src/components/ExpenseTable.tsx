import React from 'react';

interface ExpenseTableProps {
  expenses: Array<{
    id: string;
    date: string;
    vendor: string;
    amount: number;
    category: string;
    status: 'approved' | 'pending' | 'flagged';
    user?: string;
  }>;
  showActions?: boolean;
  showUser?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  expenses, 
  showActions = false,
  showUser = false,
  onApprove,
  onReject
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-700 text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Date</th>
            {showUser && <th scope="col" className="px-6 py-3">User</th>}
            <th scope="col" className="px-6 py-3">Vendor</th>
            <th scope="col" className="px-6 py-3">Amount</th>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3">Status</th>
            {showActions && <th scope="col" className="px-6 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b bg-gray-800 border-gray-700">
              <td className="px-6 py-4">{expense.date}</td>
              {showUser && <td className="px-6 py-4">{expense.user}</td>}
              <td className="px-6 py-4">{expense.vendor}</td>
              <td className="px-6 py-4">${expense.amount}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded text-xs font-medium" style={{
                  backgroundColor: getCategoryColor(expense.category),
                  color: 'white'
                }}>
                  {expense.category}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(expense.status)}`}>
                  {expense.status}
                </span>
              </td>
              {showActions && (
                <td className="px-6 py-4">
                  <button
                    onClick={() => onApprove?.(expense.id)}
                    className="text-green-500 hover:text-green-400 mr-3"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject?.(expense.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Reject
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Travel': '#3B82F6',
    'Office': '#F59E0B',
    'Food': '#10B981',
    'Misc': '#6366F1'
  };
  return colors[category] || '#6B7280';
};

const getStatusStyle = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-900 text-green-300';
    case 'pending':
      return 'bg-yellow-900 text-yellow-300';
    case 'flagged':
      return 'bg-red-900 text-red-300';
    default:
      return 'bg-gray-700 text-gray-300';
  }
};