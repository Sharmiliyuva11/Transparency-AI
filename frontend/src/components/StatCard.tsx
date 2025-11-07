import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon,
  color = 'blue'
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'green':
        return 'bg-green-900/20 text-green-500';
      case 'yellow':
        return 'bg-yellow-900/20 text-yellow-500';
      case 'red':
        return 'bg-red-900/20 text-red-500';
      default:
        return 'bg-blue-900/20 text-blue-500';
    }
  };

  return (
    <div className="p-6 rounded-lg bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {icon && (
          <span className={`p-2 rounded-full ${getColorClass()}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-white">
          {value}
        </p>
        {trend !== undefined && (
          <span className={`ml-2 text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
};