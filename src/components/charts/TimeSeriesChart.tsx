import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TimeSeriesData, ForecastResult, AnomalyPoint } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  forecasts?: ForecastResult[];
  anomalies?: AnomalyPoint[];
  height?: number;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  forecasts = [], 
  anomalies = [],
  height = 400 
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const datasets = [
    // Original data
    ...data.map(series => ({
      label: series.name,
      data: series.data.map(point => ({
        x: point.timestamp,
        y: point.value
      })),
      borderColor: series.color || '#2563EB',
      backgroundColor: `${series.color || '#2563EB'}20`,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4,
    })),
    
    // Forecasts
    ...forecasts.map((forecast, index) => ({
      label: `${forecast.method} Forecast`,
      data: forecast.data.map(point => ({
        x: point.timestamp,
        y: point.value
      })),
      borderColor: `hsl(${index * 120}, 70%, 50%)`,
      backgroundColor: `hsl(${index * 120}, 70%, 50%, 0.1)`,
      borderDash: [5, 5],
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4,
    })),
    
    // Anomalies
    anomalies.length > 0 ? {
      label: 'Anomalies',
      data: anomalies.map(anomaly => ({
        x: anomaly.timestamp,
        y: anomaly.value
      })),
      borderColor: '#EF4444',
      backgroundColor: '#EF4444',
      pointRadius: 6,
      pointHoverRadius: 8,
      showLine: false,
      pointStyle: 'triangle',
    } : null,
  ].filter(Boolean);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        type: 'category',
        display: true,
        title: {
          display: true,
          text: 'Date',
          color: 'rgb(107, 114, 128)',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
      },
      y: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Value',
          color: 'rgb(107, 114, 128)',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line ref={chartRef} data={{ datasets }} options={options} />
    </div>
  );
};

export default TimeSeriesChart;
