import { TimeSeriesPoint, Statistics, ForecastResult, AnomalyPoint, SeasonalDecomposition } from '../types';

const validateFiniteValues = (data: TimeSeriesPoint[]): void => {
  if (data.some(point => !Number.isFinite(point.value))) {
    throw new Error('Time-series values must be finite numbers');
  }
};

const validateForecastData = (data: TimeSeriesPoint[], minimumObservations: number): void => {
  if (data.length < minimumObservations) {
    throw new Error(`At least ${minimumObservations} observations are required for this forecasting method`);
  }
  validateFiniteValues(data);
};

const validateForecastHorizon = (horizon: number): void => {
  if (!Number.isInteger(horizon) || horizon < 1) {
    throw new Error('Forecast horizon must be a positive integer');
  }
};

const calculateMape = (actual: number[], predicted: number[]): number => {
  if (actual.some(value => value === 0)) {
    throw new Error('MAPE is undefined when actual values contain zero');
  }
  return actual.reduce(
    (sum, value, index) => sum + Math.abs((value - predicted[index]) / value),
    0
  ) / actual.length * 100;
};

export const calculateStatistics = (data: TimeSeriesPoint[]): Statistics => {
  const values = data.map(point => point.value);
  const n = values.length;
  if (n === 0) {
    throw new Error('At least one data point is required to calculate statistics');
  }
  validateFiniteValues(data);
  
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = n % 2 === 0 
    ? (sortedValues[n/2 - 1] + sortedValues[n/2]) / 2 
    : sortedValues[Math.floor(n/2)];
  
  const variance = n === 1
    ? 0
    : values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const std = Math.sqrt(variance);
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Skewness and Kurtosis calculations
  // Skewness and kurtosis are conventionally reported as zero for a constant series.
  const skewness = std === 0
    ? 0
    : values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
  const kurtosis = std === 0
    ? 0
    : values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n - 3;
  
  return { mean, median, std, min, max, skewness, kurtosis };
};

export const detectAnomalies = (data: TimeSeriesPoint[], method: string = 'zscore', threshold: number = 2): AnomalyPoint[] => {
  if (!Number.isFinite(threshold) || threshold < 0) {
    throw new Error('Anomaly threshold must be a finite non-negative number');
  }

  if (method !== 'zscore' && method !== 'iqr') {
    throw new Error(`Unsupported anomaly detection method: ${method}`);
  }
  validateFiniteValues(data);

  const values = data.map(point => point.value);
  const anomalies: AnomalyPoint[] = [];
  
  if (method === 'zscore') {
    const stats = calculateStatistics(data);
    data.forEach(point => {
      const zScore = Math.abs((point.value - stats.mean) / stats.std);
      if (zScore > threshold) {
        anomalies.push({
          timestamp: point.timestamp,
          value: point.value,
          score: zScore,
          method: 'Z-Score'
        });
      }
    });
  } else if (method === 'iqr') {
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = sortedValues[Math.floor(values.length * 0.25)];
    const q3 = sortedValues[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;
    
    data.forEach(point => {
      if (point.value < lowerBound || point.value > upperBound) {
        const violatedBound = point.value < lowerBound ? lowerBound : upperBound;
        // With zero spread, the normalized score is undefined; report raw distance.
        const distance = Math.abs(point.value - violatedBound);
        const score = iqr === 0 ? distance : distance / iqr;
        anomalies.push({
          timestamp: point.timestamp,
          value: point.value,
          score,
          method: 'IQR'
        });
      }
    });
  }
  
  return anomalies;
};

export const performSeasonalDecomposition = (data: TimeSeriesPoint[], period: number = 30): SeasonalDecomposition => {
  if (!Number.isInteger(period) || period < 1) {
    throw new Error('Seasonal period must be a positive integer');
  }
  validateFiniteValues(data);

  const values = data.map(point => point.value);
  const n = values.length;
  
  // Simple moving average for trend
  const trend: TimeSeriesPoint[] = [];
  const seasonal: TimeSeriesPoint[] = [];
  const residual: TimeSeriesPoint[] = [];
  
  for (let i = 0; i < n; i++) {
    // Calculate trend using moving average
    const halfPeriod = Math.floor(period / 2);
    const start = Math.max(0, i - halfPeriod);
    const end = Math.min(n, i + halfPeriod + 1);
    const trendValue = values.slice(start, end).reduce((sum, val) => sum + val, 0) / (end - start);
    
    trend.push({
      timestamp: data[i].timestamp,
      value: trendValue
    });
    
    // Calculate seasonal component (simplified)
    const seasonalIndex = i % period;
    const seasonalValues = [];
    for (let j = seasonalIndex; j < n; j += period) {
      if (j < values.length) {
        seasonalValues.push(values[j] - trend[Math.min(j, trend.length - 1)].value);
      }
    }
    const seasonalValue = seasonalValues.length > 0 
      ? seasonalValues.reduce((sum, val) => sum + val, 0) / seasonalValues.length 
      : 0;
    
    seasonal.push({
      timestamp: data[i].timestamp,
      value: seasonalValue
    });
    
    // Residual = Original - Trend - Seasonal
    residual.push({
      timestamp: data[i].timestamp,
      value: values[i] - trendValue - seasonalValue
    });
  }
  
  return { trend, seasonal, residual };
};

export const linearRegression = (data: TimeSeriesPoint[], horizon: number): ForecastResult => {
  validateForecastHorizon(horizon);
  validateForecastData(data, 2);
  const n = data.length;
  const x = data.map((_, i) => i);
  const y = data.map(point => point.value);
  
  // Calculate linear regression coefficients
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate forecasts
  const forecasts: TimeSeriesPoint[] = [];
  const lastDate = new Date(data[data.length - 1].timestamp);
  
  for (let i = 1; i <= horizon; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    
    forecasts.push({
      timestamp: futureDate.toISOString().split('T')[0],
      value: slope * (n + i - 1) + intercept
    });
  }
  
  // Calculate metrics on training data
  const predictions = x.map(xi => slope * xi + intercept);
  const mae = y.reduce((sum, actual, i) => sum + Math.abs(actual - predictions[i]), 0) / n;
  const rmse = Math.sqrt(y.reduce((sum, actual, i) => sum + Math.pow(actual - predictions[i], 2), 0) / n);
  const mape = calculateMape(y, predictions);
  
  return {
    method: 'Linear Regression',
    data: forecasts,
    metrics: { mae, rmse, mape }
  };
};

export const exponentialSmoothing = (data: TimeSeriesPoint[], horizon: number, alpha: number = 0.3): ForecastResult => {
  validateForecastHorizon(horizon);
  validateForecastData(data, 1);
  const values = data.map(point => point.value);
  let forecast = values[0];
  const smoothed = [forecast];
  
  // Apply exponential smoothing
  for (let i = 1; i < values.length; i++) {
    forecast = alpha * values[i] + (1 - alpha) * forecast;
    smoothed.push(forecast);
  }
  
  // Generate future forecasts
  const forecasts: TimeSeriesPoint[] = [];
  const lastDate = new Date(data[data.length - 1].timestamp);
  
  for (let i = 1; i <= horizon; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    
    forecasts.push({
      timestamp: futureDate.toISOString().split('T')[0],
      value: forecast
    });
  }
  
  // Calculate metrics
  const mae = values.reduce((sum, actual, i) => sum + Math.abs(actual - smoothed[i]), 0) / values.length;
  const rmse = Math.sqrt(values.reduce((sum, actual, i) => sum + Math.pow(actual - smoothed[i], 2), 0) / values.length);
  const mape = calculateMape(values, smoothed);
  
  return {
    method: 'Exponential Smoothing',
    data: forecasts,
    metrics: { mae, rmse, mape }
  };
};

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

export const arimaSimulation = (data: TimeSeriesPoint[], horizon: number, seed: number = 42): ForecastResult => {
  validateForecastHorizon(horizon);
  validateForecastData(data, 2);
  // Simplified ARIMA simulation (in reality, this would be much more complex)
  const values = data.map(point => point.value);
  const n = values.length;
  const random = createSeededRandom(seed);
  
  // Calculate differences for stationarity
  const diffs = [];
  for (let i = 1; i < n; i++) {
    diffs.push(values[i] - values[i - 1]);
  }
  
  // Simple autoregressive component
  const arCoeff = 0.5;
  const maCoeff = 0.3;
  
  let lastValue = values[n - 1];
  let lastDiff = diffs[diffs.length - 1];
  
  const forecasts: TimeSeriesPoint[] = [];
  const lastDate = new Date(data[data.length - 1].timestamp);
  
  for (let i = 1; i <= horizon; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    
    // Simplified ARIMA forecast
    const predictedDiff = arCoeff * lastDiff + maCoeff * (random() - 0.5);
    lastValue += predictedDiff;
    lastDiff = predictedDiff;
    
    forecasts.push({
      timestamp: futureDate.toISOString().split('T')[0],
      value: lastValue
    });
  }
  
  // Calculate rough metrics (simplified)
  const mae = values.slice(-10).reduce((sum, val, i) => sum + Math.abs(val - values[values.length - 10 + i - 1] || val), 0) / 10;
  const rmse = Math.sqrt(mae * mae);
  const mape = mae / (values.reduce((sum, val) => sum + val, 0) / values.length) * 100;
  
  return {
    method: 'ARIMA (Simulated)',
    data: forecasts,
    metrics: { mae, rmse, mape }
  };
};
