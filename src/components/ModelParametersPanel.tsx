import React from 'react';
import { ModelParameters } from '../types';

interface ModelParametersPanelProps {
  parameters: ModelParameters;
  onParametersChange: (parameters: ModelParameters) => void;
}

const ModelParametersPanel: React.FC<ModelParametersPanelProps> = ({
  parameters,
  onParametersChange,
}) => {
  const handleChange = (key: keyof ModelParameters, value: number) => {
    onParametersChange({
      ...parameters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Model Parameters
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Forecast Horizon (days)
          </label>
          <input
            type="range"
            min="1"
            max="365"
            value={parameters.forecastHorizon}
            onChange={(e) => handleChange('forecastHorizon', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>1</span>
            <span className="font-medium">{parameters.forecastHorizon}</span>
            <span>365</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confidence Level (%)
          </label>
          <input
            type="range"
            min="80"
            max="99"
            value={parameters.confidenceLevel}
            onChange={(e) => handleChange('confidenceLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>80%</span>
            <span className="font-medium">{parameters.confidenceLevel}%</span>
            <span>99%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seasonal Period (days)
          </label>
          <input
            type="range"
            min="7"
            max="365"
            value={parameters.seasonalPeriod}
            onChange={(e) => handleChange('seasonalPeriod', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>7</span>
            <span className="font-medium">{parameters.seasonalPeriod}</span>
            <span>365</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Anomaly Threshold
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={parameters.anomalyThreshold}
            onChange={(e) => handleChange('anomalyThreshold', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>1.0</span>
            <span className="font-medium">{parameters.anomalyThreshold.toFixed(1)}</span>
            <span>5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelParametersPanel;