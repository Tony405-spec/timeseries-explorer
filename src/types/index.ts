export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface TimeSeriesData {
  id: string;
  name: string;
  data: TimeSeriesPoint[];
  color?: string;
}

export interface ForecastResult {
  method: string;
  data: TimeSeriesPoint[];
  confidence?: {
    upper: TimeSeriesPoint[];
    lower: TimeSeriesPoint[];
  };
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
  };
}

export interface AnomalyPoint {
  timestamp: string;
  value: number;
  score: number;
  method: string;
}

export interface SeasonalDecomposition {
  trend: TimeSeriesPoint[];
  seasonal: TimeSeriesPoint[];
  residual: TimeSeriesPoint[];
}

export interface ModelParameters {
  forecastHorizon: number;
  confidenceLevel: number;
  seasonalPeriod: number;
  anomalyThreshold: number;
}

export type Theme = 'light' | 'dark';

export interface Statistics {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
}