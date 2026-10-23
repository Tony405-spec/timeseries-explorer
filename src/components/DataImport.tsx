import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { TimeSeriesData, TimeSeriesPoint } from '../types';

interface DataImportProps {
  onDataImport: (data: TimeSeriesData) => void;
}

const DataImport: React.FC<DataImportProps> = ({ onDataImport }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleFileUpload = useCallback((file: File) => {
    setImportStatus({ status: 'idle', message: 'Processing file...' });

    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          if (validateJsonData(jsonData)) {
            onDataImport(jsonData);
            setImportStatus({ status: 'success', message: 'JSON data imported successfully!' });
          } else {
            setImportStatus({ status: 'error', message: 'Invalid JSON format. Expected: {id, name, data: [{timestamp, value}]}' });
          }
        } catch (error) {
          setImportStatus({ status: 'error', message: 'Failed to parse JSON file.' });
        }
      };
      reader.readAsText(file);
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          try {
            const data = processCsvData(results.data, file.name);
            onDataImport(data);
            setImportStatus({ status: 'success', message: 'CSV data imported successfully!' });
          } catch (error) {
            setImportStatus({ status: 'error', message: `Failed to process CSV file: ${error instanceof Error ? error.message : 'Unknown error'}` });
          }
        },
        error: (error) => {
          setImportStatus({ status: 'error', message: `CSV parsing error: ${error.message}` });
        }
      });
    } else {
      setImportStatus({ status: 'error', message: 'Unsupported file type. Please use CSV or JSON files.' });
    }
  }, [onDataImport]);

  const validateJsonData = (data: unknown): data is TimeSeriesData => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const candidate = data as Record<string, unknown>;
    return typeof candidate.id === 'string' &&
           typeof candidate.name === 'string' &&
           Array.isArray(candidate.data) &&
           candidate.data.length > 0 &&
           candidate.data.every((point: unknown) => {
             if (typeof point !== 'object' || point === null) {
               return false;
             }

             const observation = point as Record<string, unknown>;
             return typeof observation.timestamp === 'string' &&
                    observation.timestamp.trim() !== '' &&
                    Number.isFinite(Date.parse(observation.timestamp)) &&
                    typeof observation.value === 'number' &&
                    Number.isFinite(observation.value);
           });
  };

  const processCsvData = (csvData: any[], filename: string): TimeSeriesData => {
    const processedData: TimeSeriesPoint[] = [];
    
    // Get column headers and find date/value columns flexibly
    const headers = Object.keys(csvData[0] || {});
    const dateColumn = headers.find(h => 
      h.toLowerCase().includes('date') || 
      h.toLowerCase().includes('time') || 
      h.toLowerCase().includes('timestamp') ||
      h.toLowerCase() === 'ds' // Prophet format
    );
    const valueColumn = headers.find(h => 
      h.toLowerCase().includes('value') || 
      h.toLowerCase().includes('price') || 
      h.toLowerCase().includes('amount') ||
      h.toLowerCase().includes('sales') ||
      h.toLowerCase().includes('revenue') ||
      h.toLowerCase() === 'y' || // Prophet format
      h.toLowerCase() === 'close' || // Stock data
      h.toLowerCase() === 'open' ||
      h.toLowerCase() === 'high' ||
      h.toLowerCase() === 'low'
    ) || headers.find(h => {
      const value = String(csvData[0][h] ?? '').trim();
      return value !== '' && Number.isFinite(Number(value));
    }); // Find any numeric column
    
    csvData.forEach((row, index) => {
      const dateValue = dateColumn ? row[dateColumn] : null;
      const numericValue = valueColumn ? row[valueColumn] : null;
      
      if (
        dateValue != null && String(dateValue).trim() !== '' &&
        numericValue != null && String(numericValue).trim() !== ''
      ) {
        try {
          const parsedDate = new Date(dateValue);
          const value = Number(numericValue);
        
          if (Number.isFinite(value) && Number.isFinite(parsedDate.getTime())) {
            const timestamp = parsedDate.toISOString().split('T')[0];
            processedData.push({ timestamp, value });
          }
        } catch (error) {
          // Skip invalid rows
        }
      }
    });

    if (processedData.length === 0) {
      throw new Error(`No valid data found. Available columns: ${headers.join(', ')}`);
    }

    // Sort by timestamp
    processedData.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return {
      id: `imported-${Date.now()}`,
      name: `${filename.replace(/\.[^/.]+$/, '')} (${processedData.length} points)`,
      data: processedData,
      color: '#8B5CF6'
    };
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Import Time Series Data
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload CSV or JSON files containing your time series data. CSV files should have 'date' and 'value' columns.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Drop your files here
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          or click to browse
        </p>
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          <FileText className="h-4 w-4 mr-2" />
          Select File
        </label>
      </div>

      {importStatus.message && (
        <div className={`mt-4 p-4 rounded-lg flex items-center ${
          importStatus.status === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : importStatus.status === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
        }`}>
          {importStatus.status === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
          {importStatus.message}
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Supported Formats
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">CSV Format:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Flexible column detection - supports various naming conventions:
            </p>
            <pre className="mt-2 text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded text-gray-800 dark:text-gray-200">
{`# Any of these work:
date,value          timestamp,price
time,sales          ds,y (Prophet)
datetime,amount     date,close (stocks)

2024-01-01,100.5
2024-01-02,102.3`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">JSON Format:</h4>
            <pre className="mt-2 text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded text-gray-800 dark:text-gray-200">
{`{
  "id": "my-data",
  "name": "My Dataset",
  "data": [
    {"timestamp": "2024-01-01", "value": 100.5},
    {"timestamp": "2024-01-02", "value": 102.3}
  ]
}`}
            </pre>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Supported Column Names:</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div><strong>Date columns:</strong> date, time, timestamp, datetime, ds</div>
              <div><strong>Value columns:</strong> value, price, amount, sales, revenue, y, close, open, high, low</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImport;
