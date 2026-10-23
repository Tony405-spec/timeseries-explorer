import { describe, expect, it } from 'vitest';
import {
  calculateStatistics,
  detectAnomalies,
  exponentialSmoothing,
  linearRegression,
  performSeasonalDecomposition,
} from './statistics';
import type { TimeSeriesPoint } from '../types';

const points = (values: number[]): TimeSeriesPoint[] => values.map((value, index) => ({
  timestamp: `2024-01-${String(index + 1).padStart(2, '0')}`,
  value,
}));

describe('detectAnomalies', () => {
  it('scores low and high IQR anomalies from the violated bound', () => {
    const anomalies = detectAnomalies(points([-11, 1, 2, 3, 4, 5, 6, 7, 8, 29]), 'iqr', 2);

    expect(anomalies.map(({ value, score }) => [value, score])).toEqual([
      [-11, 0.6],
      [29, 2.4],
    ]);
  });

  it('applies the selected threshold to IQR bounds', () => {
    const data = points([-11, 1, 2, 3, 4, 5, 6, 7, 8, 29]);

    expect(detectAnomalies(data, 'iqr', 5)).toEqual([]);
    expect(detectAnomalies(data, 'iqr', 1)).toHaveLength(2);
  });
});

describe('performSeasonalDecomposition', () => {
  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid period %s',
    (period) => {
      expect(() => performSeasonalDecomposition(points([1]), period)).toThrow(
        'Seasonal period must be a positive integer',
      );
    },
  );

  it('completes with a positive integer period', () => {
    const result = performSeasonalDecomposition(points([1, 2]), 1);

    expect(result.trend).toHaveLength(2);
    expect(result.seasonal).toHaveLength(2);
    expect(result.residual).toHaveLength(2);
  });
});

describe('forecast MAPE', () => {
  it.each([linearRegression, exponentialSmoothing])(
    'rejects zero-valued actuals in %s',
    (forecast) => {
      expect(() => forecast(points([0, 2]), 1)).toThrow(
        'MAPE is undefined when actual values contain zero',
      );
    },
  );

  it('returns finite MAPE for nonzero actuals', () => {
    expect(linearRegression(points([2, 4]), 1).metrics.mape).toBe(0);
    expect(Number.isFinite(exponentialSmoothing(points([2, 4]), 1).metrics.mape)).toBe(true);
  });
});

describe('calculateStatistics', () => {
  it('returns finite moments for a constant series', () => {
    expect(calculateStatistics(points([4, 4, 4]))).toEqual({
      mean: 4, median: 4, std: 0, min: 4, max: 4, skewness: 0, kurtosis: 0,
    });
  });

  it('rejects fewer than two observations', () => {
    expect(() => calculateStatistics([])).toThrow(
      'At least two data points are required to calculate statistics',
    );
    expect(() => calculateStatistics(points([4]))).toThrow(
      'At least two data points are required to calculate statistics',
    );
  });
});
