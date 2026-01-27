import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import TimeSeriesChart from '../charts/TimeSeriesChart';
import StatisticsCard from '../StatisticsCard';
import { TimeSeriesData, Statistics } from '../../types';
import { calculateStatistics, detectAnomalies } from '../../utils/statistics';
import { generateRealtimeData } from '../../utils/dataGeneration';

interface OverviewTabProps {
  datasets: TimeSeriesData[];
  activeDataset: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ datasets, activeDataset }) => {
  const [realtimeData, setRealtimeData] = useState<TimeSeriesData[]>(datasets);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  const currentDataset = realtimeData.find(d => d.id === activeDataset);

  useEffect(() => {
    if (currentDataset) {
      const stats = calculateStatistics(currentDataset.data);
      setStatistics(stats);
    }
  }, [currentDataset]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prevData => 
        prevData.map(dataset => {
          if (dataset.id === activeDataset && dataset.data.length > 0) {
            const lastPoint = dataset.data[dataset.data.length - 1];
            const newTimestamp = new Date(Date.now()).toISOString().split('T')[0];
            const newPoint = generateRealtimeData(lastPoint.value, newTimestamp);
            
            return {
              ...dataset,
              data: [...dataset.data.slice(-100), newPoint] // Keep last 100 points
            };
          }
          return dataset;
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [activeDataset]);

  if (!currentDataset || !statistics) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Select a dataset to view overview</p>
      </div>
    );
  }

  const anomalies = detectAnomalies(currentDataset.data, 'zscore', 2);
  const latestValue = currentDataset.data[currentDataset.data.length - 1]?.value || 0;
  const previousValue = currentDataset.data[currentDataset.data.length - 2]?.value || 0;
  const changePercent = previousValue !== 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0;

  const keyMetrics = [
    {
      label: 'Current Value',
      value: latestValue.toFixed(2),
      change: changePercent.toFixed(1) + '%',
      positive: changePercent >= 0,
      icon: changePercent >= 0 ? TrendingUp : TrendingDown,
    },
    {
      label: 'Data Points',
      value: currentDataset.data.length.toLocaleString(),
      change: '+1 (Live)',
      positive: true,
      icon: Activity,
    },
    {
      label: 'Anomalies',
      value: anomalies.length.toString(),
      change: `${((anomalies.length / currentDataset.data.length) * 100).toFixed(1)}% of data`,
      positive: anomalies.length === 0,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Overview - {currentDataset.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time analytics and key metrics for your time series data
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                <Icon className={`h-5 w-5 ${metric.positive ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </div>
              <div className={`text-sm ${metric.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {metric.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Time Series Visualization
          </h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Live Data</span>
          </div>
        </div>
        <TimeSeriesChart 
          data={[currentDataset]} 
          anomalies={anomalies}
          height={400}
        />
      </div>

      {/* Statistics */}
      <StatisticsCard statistics={statistics} title={`Statistics - ${currentDataset.name}`} />
    </div>
  );
};

export default OverviewTab;