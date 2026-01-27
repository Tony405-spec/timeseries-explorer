import React from 'react';
import { Statistics } from '../types';

interface StatisticsCardProps {
  statistics: Statistics;
  title?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ statistics, title = 'Statistical Summary' }) => {
  const stats = [
    { label: 'Mean', value: statistics.mean.toFixed(2) },
    { label: 'Median', value: statistics.median.toFixed(2) },
    { label: 'Std Dev', value: statistics.std.toFixed(2) },
    { label: 'Min', value: statistics.min.toFixed(2) },
    { label: 'Max', value: statistics.max.toFixed(2) },
    { label: 'Skewness', value: statistics.skewness.toFixed(3) },
    { label: 'Kurtosis', value: statistics.kurtosis.toFixed(3) },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{stat.label}:</span>
            <span className="font-medium text-gray-900 dark:text-white">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsCard;