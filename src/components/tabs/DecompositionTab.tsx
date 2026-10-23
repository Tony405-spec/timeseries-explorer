import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import DecompositionChart from '../charts/DecompositionChart';
import { TimeSeriesData, SeasonalDecomposition } from '../../types';
import { performSeasonalDecomposition } from '../../utils/statistics';

interface DecompositionTabProps {
  datasets: TimeSeriesData[];
  activeDataset: string;
}

const DecompositionTab: React.FC<DecompositionTabProps> = ({ datasets, activeDataset }) => {
  const [decomposition, setDecomposition] = useState<SeasonalDecomposition | null>(null);
  const [seasonalPeriod, setSeasonalPeriod] = useState(30);
  const [isDecomposing, setIsDecomposing] = useState(false);

  const currentDataset = datasets.find(d => d.id === activeDataset);

  const runDecomposition = useCallback(() => {
    if (!currentDataset) return;

    setIsDecomposing(true);
    try {
      const result = performSeasonalDecomposition(currentDataset.data, seasonalPeriod);
      setDecomposition(result);
    } catch (error) {
      console.error('Decomposition error:', error);
    } finally {
      setIsDecomposing(false);
    }
  }, [currentDataset, seasonalPeriod]);

  useEffect(() => {
    runDecomposition();
  }, [runDecomposition]);

  if (!currentDataset) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Select a dataset to perform decomposition</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Seasonal Decomposition
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Break down your time series into trend, seasonal, and residual components
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Decomposition Parameters
            </h3>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seasonal Period (days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={seasonalPeriod}
                  onChange={(e) => setSeasonalPeriod(parseInt(e.target.value) || 30)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runDecomposition}
                  disabled={isDecomposing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDecomposing ? 'Decomposing...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Dataset</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDataset.name}
            </div>
          </div>
        </div>
      </div>

      {/* Decomposition Results */}
      {decomposition && (
        <>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Component Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.abs(decomposition.trend[decomposition.trend.length - 1]?.value - decomposition.trend[0]?.value || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Trend Change</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(Math.max(...decomposition.seasonal.map(p => p.value)) - Math.min(...decomposition.seasonal.map(p => p.value))).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Seasonal Range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.sqrt(decomposition.residual.reduce((sum, p) => sum + p.value * p.value, 0) / decomposition.residual.length).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Residual RMS</div>
              </div>
            </div>
          </div>

          <DecompositionChart decomposition={decomposition} />
        </>
      )}

      {/* Interpretation Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
          Understanding Decomposition Components
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <div><strong>Trend:</strong> Long-term direction or pattern in the data</div>
          <div><strong>Seasonal:</strong> Regular, predictable patterns that repeat over fixed periods</div>
          <div><strong>Residual:</strong> Random or irregular fluctuations after removing trend and seasonality</div>
        </div>
      </div>
    </div>
  );
};

export default DecompositionTab;
