import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import TimeSeriesChart from '../charts/TimeSeriesChart';
import { TimeSeriesData, AnomalyPoint } from '../../types';
import { detectAnomalies } from '../../utils/statistics';

interface AnomalyTabProps {
  datasets: TimeSeriesData[];
  activeDataset: string;
}

const AnomalyTab: React.FC<AnomalyTabProps> = ({ datasets, activeDataset }) => {
  const [anomalies, setAnomalies] = useState<AnomalyPoint[]>([]);
  const [detectionMethod, setDetectionMethod] = useState<'zscore' | 'iqr'>('zscore');
  const [threshold, setThreshold] = useState(2.0);
  const [isDetecting, setIsDetecting] = useState(false);

  const currentDataset = datasets.find(d => d.id === activeDataset);

  const runAnomalyDetection = useCallback(() => {
    if (!currentDataset) return;

    setIsDetecting(true);
    try {
      const detected = detectAnomalies(currentDataset.data, detectionMethod, threshold);
      setAnomalies(detected);
    } catch (error) {
      console.error('Anomaly detection error:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [currentDataset, detectionMethod, threshold]);

  useEffect(() => {
    runAnomalyDetection();
  }, [runAnomalyDetection]);

  if (!currentDataset) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Select a dataset to detect anomalies</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Anomaly Detection
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Identify unusual patterns and outliers in your time series data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Detection Results */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Anomaly Detection Results
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Found {anomalies.length} anomalies
                </span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  anomalies.length === 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {anomalies.length === 0 ? 'Clean' : 'Anomalies Detected'}
                </div>
              </div>
            </div>
            <TimeSeriesChart 
              data={[currentDataset]} 
              anomalies={anomalies}
              height={400}
            />
          </div>

          {/* Anomaly List */}
          {anomalies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Anomaly Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 text-gray-900 dark:text-white">Date</th>
                      <th className="text-right py-2 text-gray-900 dark:text-white">Value</th>
                      <th className="text-right py-2 text-gray-900 dark:text-white">Score</th>
                      <th className="text-right py-2 text-gray-900 dark:text-white">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {anomalies.slice(0, 20).map((anomaly, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-2 text-gray-900 dark:text-white">
                          {anomaly.timestamp}
                        </td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                          {anomaly.value.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            anomaly.score > 3
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {anomaly.score.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                          {anomaly.method}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {anomalies.length > 20 && (
                  <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                    ... and {anomalies.length - 20} more anomalies
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detection Parameters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detection Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detection Method
              </label>
              <select
                value={detectionMethod}
                onChange={(e) => setDetectionMethod(e.target.value as 'zscore' | 'iqr')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="zscore">Z-Score Method</option>
                <option value="iqr">IQR Method</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {detectionMethod === 'zscore' 
                  ? 'Detects points beyond standard deviations from mean'
                  : 'Detects points outside interquartile range'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sensitivity Threshold
              </label>
              <input
                type="range"
                min={detectionMethod === 'zscore' ? '1' : '1.5'}
                max={detectionMethod === 'zscore' ? '5' : '3'}
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>Sensitive</span>
                <span className="font-medium">{threshold}</span>
                <span>Conservative</span>
              </div>
            </div>

            <button
              onClick={runAnomalyDetection}
              disabled={isDetecting}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Search className="h-4 w-4 mr-2" />
              {isDetecting ? 'Detecting...' : 'Detect Anomalies'}
            </button>
          </div>

          {/* Summary Stats */}
          {anomalies.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Detection Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Points:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currentDataset.data.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Anomalies:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {anomalies.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Anomaly Rate:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {((anomalies.length / currentDataset.data.length) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnomalyTab;
