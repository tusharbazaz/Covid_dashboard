import { useState, useEffect, useCallback } from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Filters from './components/Filters';
import StatsCards from './components/StatsCards';
import AnalysisSummary from './components/AnalysisSummary';
import ChartsSection from './components/ChartsSection';
import DataTable from './components/DataTable';
import LoadingOverlay from './components/LoadingOverlay';
import ToastContainer from './components/ToastContainer';
import ComparisonSection from './components/ComparisonSection';
import HotspotsSection from './components/HotspotsSection';
import PredictionsSection from './components/PredictionsSection';
import { api } from './services/api';
import { useToast } from './hooks/useToast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useChartTheme } from './hooks/useChartTheme';
import { exportData } from './utils/exportData';
import { performanceMonitor } from './utils/performanceMonitor';

function App() {
  // Global state
  const [countries, setCountries] = useState([]);
  const [currentCountry, setCurrentCountry] = useLocalStorage('selectedCountry', 'global');
  const [currentDays, setCurrentDays] = useLocalStorage('selectedDays', '90');
  const [lastData, setLastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', true);
  const { toasts, showToast } = useToast();

  // Feature visibility states
  const [showComparison, setShowComparison] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);

  // Apply chart theme
  useChartTheme(darkMode);

  // Initialize theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load countries on mount
  useEffect(() => {
    performanceMonitor.mark('app-init-start');
    loadCountries();
  }, []);

  // Reload when filters change
// Reload whenever we’ve got a country list AND the filters change (or on initial load)
 useEffect(() => {
    if (countries.length > 0) {
      reload();
    }
  }, [countries, currentCountry, currentDays]);

  const loadCountries = async () => {
    try {
      performanceMonitor.mark('load-countries-start');
      const data = await api.getCountries();
      setCountries(data);
      performanceMonitor.mark('load-countries-end');
      performanceMonitor.measure('load-countries', 'load-countries-start', 'load-countries-end');
    } catch (error) {
      console.error('Error loading countries:', error);
      showToast('Failed to load countries', 'error');
    }
  };

  const reload = useCallback(async () => {
    setLoading(true);
    performanceMonitor.mark('reload-start');
    
    try {
      const [stats, historical] = await Promise.all([
        api.getStats(currentCountry),
        api.getHistorical(currentCountry, currentDays)
      ]);
      
      setLastData({ stats, historical });
      performanceMonitor.mark('reload-end');
      performanceMonitor.measure('reload', 'reload-start', 'reload-end');
    } catch (error) {
      console.error('Error reloading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentCountry, currentDays]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    showToast(`${newDarkMode ? 'Dark' : 'Light'} mode enabled`, 'info');
  };

  const handleExport = async () => {
    if (!lastData) {
      showToast('No data to export', 'warning');
      return;
    }
    
    try {
      await exportData(lastData, currentCountry);
      showToast('Data exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const closeAllModals = () => {
    setShowComparison(false);
    setShowHotspots(false);
    setShowPredictions(false);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { 
      key: 'r', 
      ctrl: true, 
      handler: () => {
        reload();
        showToast('Data refreshed', 'info');
      } 
    },
    { key: 'e', ctrl: true, handler: handleExport },
    { key: 'd', ctrl: true, handler: toggleTheme },
    { 
      key: 'f', 
      ctrl: true, 
      handler: () => {
        const searchInput = document.querySelector('input[type="text"]');
        searchInput?.focus();
      } 
    },
    { key: 'Escape', handler: closeAllModals },
    { 
      key: 'h', 
      ctrl: true, 
      handler: () => {
        showKeyboardShortcuts();
      } 
    }
  ]);

  // Auto-refresh every 5 minutes
  useAutoRefresh(() => {
    reload();
    showToast('Data refreshed automatically', 'info');
  }, 5 * 60 * 1000);

  const showKeyboardShortcuts = () => {
    const shortcuts = [
      { keys: 'Ctrl+R', description: 'Refresh data' },
      { keys: 'Ctrl+E', description: 'Export data' },
      { keys: 'Ctrl+D', description: 'Toggle dark mode' },
      { keys: 'Ctrl+F', description: 'Focus search' },
      { keys: 'Ctrl+H', description: 'Show shortcuts' },
      { keys: 'Esc', description: 'Close modals' }
    ];

    const message = shortcuts.map(s => `${s.keys}: ${s.description}`).join('\n');
    alert('Keyboard Shortcuts:\n\n' + message);
  };

  return (
    <ErrorBoundary>
      <div className="w-screen min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <Navbar 
          darkMode={darkMode} 
          toggleTheme={toggleTheme}
          onRefresh={() => {
            reload();
            showToast('Data refreshed', 'success');
          }}
        />

        <main className="w-full px-2 sm:px-4 py-4 sm:py-6">
          <section className="w-full mb-6">
            <Filters
              countries={countries}
              currentCountry={currentCountry}
              currentDays={currentDays}
              onCountryChange={setCurrentCountry}
              onDaysChange={setCurrentDays}
              onCompare={() => setShowComparison(!showComparison)}
              onHotspots={() => setShowHotspots(!showHotspots)}
              onPredictions={() => {
                if (currentCountry === 'global') {
                  showToast('Please select a specific country for predictions', 'warning');
                } else {
                  setShowPredictions(!showPredictions);
                }
              }}
              onExport={handleExport}
              showToast={showToast}
            />
          </section>
          <section className="w-full">
            
            {lastData && (
              <>
                <StatsCards stats={lastData.stats} />
                {lastData.stats.analysis && (
                  <AnalysisSummary analysis={lastData.stats.analysis} />
                )}
              </>
            )}
            

            <ChartsSection 
              data={lastData}
              country={currentCountry}
              countries={countries}
            />

            {showComparison && (
              <ComparisonSection 
                countries={countries}
                showToast={showToast}
              />
            )}

            {showHotspots && (
              <HotspotsSection showToast={showToast} />
            )}

            {showPredictions && currentCountry !== 'global' && (
              <PredictionsSection 
                country={currentCountry}
                showToast={showToast}
              />
            )}

            <DataTable 
              countries={countries}
              onViewDetails={(country) => {
                setCurrentCountry(country);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showToast={showToast}
            />
          </section>
        </main>

        <LoadingOverlay loading={loading} />
        <ToastContainer toasts={toasts} />

        {/* Help Button */}
        <button
          onClick={showKeyboardShortcuts}
          className="fixed bottom-4 right-4 bg-gray-600 text-white p-3 rounded-full shadow-lg z-40 hover:bg-gray-700 transition"
          title="Keyboard shortcuts (Ctrl+H)"
        >
          <i className="fas fa-question-circle"></i>
        </button>
      </div>
    </ErrorBoundary>
  );
}

export default App;
