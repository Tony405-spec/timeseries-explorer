import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import OverviewTab from './components/tabs/OverviewTab';
import ForecastingTab from './components/tabs/ForecastingTab';
import AnomalyTab from './components/tabs/AnomalyTab';
import DecompositionTab from './components/tabs/DecompositionTab';
import DataImport from './components/DataImport';
import { ThemeProvider } from './context/ThemeContext';
import { TimeSeriesData } from './types';
import { generateSampleData } from './utils/dataGeneration';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [datasets, setDatasets] = useState<TimeSeriesData[]>([]);
  const [activeDataset, setActiveDataset] = useState<string>('');

  useEffect(() => {
    // Load sample data on startup
    const sampleData = generateSampleData();
    setDatasets(sampleData);
    setActiveDataset(sampleData[0]?.id || '');
  }, []);

  const selectedDataset = datasets.find((dataset) => dataset.id === activeDataset);

  const handleDataImport = (newData: TimeSeriesData) => {
    setDatasets(prev => [...prev, newData]);
    setActiveDataset(newData.id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab datasets={datasets} activeDataset={activeDataset} />;
      case 'forecasting':
        return <ForecastingTab datasets={datasets} activeDataset={activeDataset} />;
      case 'anomaly':
        return <AnomalyTab datasets={datasets} activeDataset={activeDataset} />;
      case 'decomposition':
        return <DecompositionTab datasets={datasets} activeDataset={activeDataset} />;
      case 'import':
        return <DataImport onDataImport={handleDataImport} />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Application settings and configuration options
              </p>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Active Dataset
                    </label>
                    <select
                      value={activeDataset}
                      onChange={(e) => setActiveDataset(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {datasets.map((dataset) => (
                        <option key={dataset.id} value={dataset.id}>
                          {dataset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {datasets.length} dataset(s) loaded
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <OverviewTab datasets={datasets} activeDataset={activeDataset} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} activeDataset={selectedDataset} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;