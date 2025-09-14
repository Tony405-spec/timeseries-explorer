import { TimeSeriesData, TimeSeriesPoint } from '../types';

export const generateSampleData = (): TimeSeriesData[] => {
  const now = new Date();
  const datasets: TimeSeriesData[] = [];

  // Stock Price Data
  const stockData: TimeSeriesPoint[] = [];
  let stockPrice = 100;
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add trend, seasonality, and noise
    const trend = 0.02;
    const seasonal = 10 * Math.sin((2 * Math.PI * i) / 30); // Monthly seasonality
    const noise = (Math.random() - 0.5) * 5;
    
    stockPrice += trend + seasonal * 0.1 + noise;
    stockData.push({
      timestamp: date.toISOString().split('T')[0],
      value: Math.max(stockPrice, 50) // Ensure positive values
    });
  }

  datasets.push({
    id: 'stock-price',
    name: 'Stock Price ($)',
    data: stockData,
    color: '#2563EB'
  });

  // Sales Data
  const salesData: TimeSeriesPoint[] = [];
  let baseSales = 1000;
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Weekly seasonality with weekend dips
    const dayOfWeek = date.getDay();
    const weekendEffect = dayOfWeek === 0 || dayOfWeek === 6 ? -200 : 0;
    
    // Monthly seasonality
    const monthly = 300 * Math.sin((2 * Math.PI * i) / 30);
    
    // Holiday effects (simulate spikes)
    const holiday = i % 90 === 0 ? 500 : 0;
    
    const noise = (Math.random() - 0.5) * 100;
    const dailySales = baseSales + weekendEffect + monthly + holiday + noise;
    
    salesData.push({
      timestamp: date.toISOString().split('T')[0],
      value: Math.max(dailySales, 0)
    });
    
    // Slight upward trend
    baseSales += 0.5;
  }

  datasets.push({
    id: 'sales-data',
    name: 'Daily Sales',
    data: salesData,
    color: '#10B981'
  });

  // Temperature Data
  const temperatureData: TimeSeriesPoint[] = [];
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Annual seasonality
    const annual = 15 * Math.sin((2 * Math.PI * i) / 365 + Math.PI); // Shifted for winter/summer
    
    // Daily variation
    const daily = 5 * Math.sin((2 * Math.PI * date.getHours()) / 24);
    
    const noise = (Math.random() - 0.5) * 3;
    const temperature = 20 + annual + daily + noise; // Base 20°C
    
    temperatureData.push({
      timestamp: date.toISOString().split('T')[0],
      value: temperature
    });
  }

  datasets.push({
    id: 'temperature',
    name: 'Temperature (°C)',
    data: temperatureData,
    color: '#F59E0B'
  });

  return datasets;
};

export const generateRealtimeData = (lastValue: number, timestamp: string): TimeSeriesPoint => {
  const change = (Math.random() - 0.5) * 2;
  return {
    timestamp,
    value: Math.max(lastValue + change, 0)
  };
};