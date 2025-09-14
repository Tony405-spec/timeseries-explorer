import React from 'react';
import { Line } from 'react-chartjs-2';
import { SeasonalDecomposition } from '../../types';

interface DecompositionChartProps {
  decomposition: SeasonalDecomposition;
}

const DecompositionChart: React.FC<DecompositionChartProps> = ({ decomposition }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          maxTicksLimit: 10,
        },
      },
      y: {
        type: 'linear' as const,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
      },
    },
  };

  const components = [
    {
      title: 'Trend',
      data: decomposition.trend,
      color: '#2563EB',
    },
    {
      title: 'Seasonal',
      data: decomposition.seasonal,
      color: '#10B981',
    },
    {
      title: 'Residual',
      data: decomposition.residual,
      color: '#F59E0B',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      {components.map((component, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {component.title} Component
          </h3>
          <div style={{ height: '200px' }}>
            <Line
              data={{
                datasets: [{
                  data: component.data.map(point => ({
                    x: point.timestamp,
                    y: point.value
                  })),
                  borderColor: component.color,
                  backgroundColor: `${component.color}20`,
                  tension: 0.1,
                  pointRadius: 0,
                  pointHoverRadius: 4,
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DecompositionChart;