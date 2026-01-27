import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Upload, 
  Download,
  Moon,
  Sun,
  Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
    { id: 'anomaly', label: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'decomposition', label: 'Decomposition', icon: BarChart3 },
    { id: 'import', label: 'Import Data', icon: Upload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          TimeSeries Pro
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Advanced Analytics Platform
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 mr-3" />
          ) : (
            <Sun className="h-5 w-5 mr-3" />
          )}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        
        <button className="w-full flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-2">
          <Download className="h-5 w-5 mr-3" />
          Export Results
        </button>
      </div>
    </div>
  );
};

export default Sidebar;