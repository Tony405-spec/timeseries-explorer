import { describe, expect, it } from 'vitest';
import {
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
    const anomalies = detectAnomalies(points([-11, 1, 2, 3, 4, 5, 6, 7, 8, 29]), 'iqr');

    expect(anomalies.map(({ value, score }) => [value, score])).toEqual([
      [-11, 1.1],
      [29, 2.9],
    ]);
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
