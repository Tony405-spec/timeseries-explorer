import React, { useState, useEffect } from 'react';
import { Play, BarChart } from 'lucide-react';
import TimeSeriesChart from '../charts/TimeSeriesChart';
import ModelParametersPanel from '../ModelParametersPanel';
import { TimeSeriesData, ForecastResult, ModelParameters } from '../../types';
import { linearRegression, exponentialSmoothing, arimaSimulation } from '../../utils/statistics';

interface ForecastingTabProps {
  datasets: TimeSeriesData[];
  activeDataset: string;
}

const ForecastingTab: React.FC<ForecastingTabProps> = ({ datasets, activeDataset }) => {
  const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['linear', 'exponential']);
  const [parameters, setParameters] = useState<ModelParameters>({
    forecastHorizon: 30,
    confidenceLevel: 95,
    seasonalPeriod: 30,
    anomalyThreshold: 2.0,
  });

  const currentDataset = datasets.find(d => d.id === activeDataset);

  const forecastMethods = [
    { id: 'linear', name: 'Linear Regression', description: 'Simple linear trend extrapolation' },
    { id: 'exponential', name: 'Exponential Smoothing', description: 'Weighted moving average with decay' },
    { id: 'arima', name: 'ARIMA (Simulated)', description: 'Autoregressive integrated moving average' },
  ];

  const runForecasts = async () => {
    if (!currentDataset || selectedMethods.length === 0) return;

    setIsRunning(true);
    const results: ForecastResult[] = [];

    try {
      for (const method of selectedMethods) {
        let forecast: ForecastResult;
        
        switch (method) {
          case 'linear':
            forecast = linearRegression(currentDataset.data, parameters.forecastHorizon);
            break;
          case 'exponential':
            forecast = exponentialSmoothing(currentDataset.data, parameters.forecastHorizon);
            break;
          case 'arima':
            forecast = arimaSimulation(currentDataset.data, parameters.forecastHorizon);
            break;
          default:
            continue;
        }
        
        results.push(forecast);
      }
      
      setForecasts(results);
    } catch (error) {
      console.error('Forecasting error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleMethod = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  if (!currentDataset) {
    return (
      <div className="text-center py-12">
        <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Select a dataset to begin forecasting</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Time Series Forecasting
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Generate predictions using multiple forecasting algorithms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Method Selection */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Forecasting Methods
            </h3>
            <div className="space-y-3">
              {forecastMethods.map((method) => (
                <label key={method.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes(method.id)}
                    onChange={() => toggleMethod(method.id)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {method.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <button
              onClick={runForecasts}
              disabled={isRunning || selectedMethods.length === 0}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Generating Forecasts...' : 'Generate Forecasts'}
            </button>
          </div>

          {/* Chart */}
          {(currentDataset || forecasts.length > 0) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Forecast Results
              </h3>
              <TimeSeriesChart 
                data={[currentDataset]} 
                forecasts={forecasts}
                height={400}
              />
            </div>
          )}

          {/* Model Performance */}
          {forecasts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Model Performance Metrics
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 text-gray-900 dark:text-white">Method</th>
                      <th className="text-right py-2 text-gray-900 dark:text-white">MAE</th>
                      <th className="text-right py-2 text-gray-900 dark:text-white">RMSE</th>
                      <th className="text-right py-2 text-gray-900 dark:text-white">MAPE (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecasts.map((forecast, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 text-gray-900 dark:text-white font-medium">
                          {forecast.method}
                        </td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                          {forecast.metrics.mae.toFixed(2)}
                        </td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                          {forecast.metrics.rmse.toFixed(2)}
                        </td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                          {forecast.metrics.mape.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div>
          <ModelParametersPanel
            parameters={parameters}
            onParametersChange={setParameters}
          />
        </div>
      </div>
    </div>
  );
};

export default ForecastingTab;