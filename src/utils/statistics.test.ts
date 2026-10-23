import { describe, expect, it } from 'vitest';
import {
  arimaSimulation,
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
  it('rejects non-finite observations', () => {
    expect(() => detectAnomalies(points([1, Number.NaN, 3]))).toThrow(
      'Time-series values must be finite numbers',
    );
  });

  it('scores low and high IQR anomalies from the violated bound', () => {
    const anomalies = detectAnomalies(points([-11, 1, 2, 3, 4, 5, 6, 7, 8, 29]), 'iqr', 2);

    expect(anomalies.map(({ value, score }) => [value, score])).toEqual([
      [-11, 0.6],
      [29, 2.4],
    ]);
  });

  it('rejects unsupported detection methods instead of returning no anomalies', () => {
    expect(() => detectAnomalies(points([1, 2, 100]), 'median')).toThrow(
      'Unsupported anomaly detection method: median',
    );
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects invalid thresholds (%s)',
    (threshold) => {
      expect(() => detectAnomalies(points([1, 2, 100]), 'iqr', threshold)).toThrow(
        'Anomaly threshold must be a finite non-negative number',
      );
    },
  );

  it('applies the selected threshold to IQR bounds', () => {
    const data = points([-11, 1, 2, 3, 4, 5, 6, 7, 8, 29]);

    expect(detectAnomalies(data, 'iqr', 5)).toEqual([]);
    expect(detectAnomalies(data, 'iqr', 1)).toHaveLength(2);
  });

  it('returns finite scores when the IQR is zero', () => {
    const anomalies = detectAnomalies(points([1, 1, 1, 1, 100]), 'iqr');

    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].score).toBe(99);
    expect(Number.isFinite(anomalies[0].score)).toBe(true);
  });
});

describe('performSeasonalDecomposition', () => {
  it('rejects non-finite observations', () => {
    expect(() => performSeasonalDecomposition(points([1, Number.POSITIVE_INFINITY]))).toThrow(
      'Time-series values must be finite numbers',
    );
  });

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
  it('rejects non-finite observations', () => {
    expect(() => calculateStatistics(points([2, Number.NEGATIVE_INFINITY]))).toThrow(
      'Time-series values must be finite numbers',
    );
  });

  it('returns finite moments for a constant series', () => {
    expect(calculateStatistics(points([4, 4, 4]))).toEqual({
      mean: 4, median: 4, std: 0, min: 4, max: 4, skewness: 0, kurtosis: 0,
    });
  });

  it('returns finite statistics for a single observation', () => {
    expect(calculateStatistics(points([4]))).toEqual({
      mean: 4, median: 4, std: 0, min: 4, max: 4, skewness: 0, kurtosis: 0,
    });
  });

  it('calculates bounds for large datasets without spreading all values into a call', () => {
    const largeSeries = Array.from({ length: 200_000 }, (_, value) => ({
      timestamp: '2024-01-01',
      value,
    }));

    const statistics = calculateStatistics(largeSeries);

    expect(statistics.min).toBe(0);
    expect(statistics.max).toBe(199_999);
  });

  it('rejects an empty series', () => {
    expect(() => calculateStatistics([])).toThrow(
      'At least one data point is required to calculate statistics',
    );
  });
});

describe('forecast horizon validation', () => {
  it.each([linearRegression, exponentialSmoothing, arimaSimulation])(
    'rejects invalid horizons in %s',
    (forecast) => {
      for (const horizon of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
        expect(() => forecast(points([2, 4]), horizon)).toThrow(
          'Forecast horizon must be a positive integer',
        );
      }
    },
  );
});

describe('forecast minimum data validation', () => {
  it.each([linearRegression, exponentialSmoothing, arimaSimulation])(
    'rejects empty series in %s',
    (forecast) => {
      expect(() => forecast([], 1)).toThrow(/At least \d+ observations are required/);
    },
  );

  it.each([linearRegression, arimaSimulation])(
    'requires two observations in %s',
    (forecast) => {
      expect(() => forecast(points([4]), 1)).toThrow(
        'At least 2 observations are required for this forecasting method',
      );
    },
  );

  it('allows exponential smoothing to use one observation', () => {
    expect(exponentialSmoothing(points([4]), 1).data[0].value).toBe(4);
  });
});

describe('forecast finite input validation', () => {
  it.each([linearRegression, exponentialSmoothing, arimaSimulation])(
    'rejects non-finite observations in %s',
    (forecast) => {
      expect(() => forecast(points([2, Number.NaN]), 1)).toThrow(
        'Time-series values must be finite numbers',
      );
    },
  );
});
