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
  const [countries, setCountries]           = useState([]);
  const [currentCountry, setCurrentCountry] = useLocalStorage('selectedCountry', 'global');
  const [currentDays, setCurrentDays]       = useLocalStorage('selectedDays', '90');
  const [lastData, setLastData]             = useState(null);
  const [loading, setLoading]               = useState(false);
  const [darkMode, setDarkMode]             = useLocalStorage('darkMode', true);
  const { toasts, showToast }               = useToast();

  // Feature toggles
  const [showComparison, setShowComparison]   = useState(false);
  const [showHotspots, setShowHotspots]       = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);

  // Theme & charts
  useChartTheme(darkMode);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Load countries
  useEffect(() => {
    performanceMonitor.mark('app-init-start');
    api.getCountries()
       .then(setCountries)
       .catch(() => showToast('Failed to load countries', 'error'));
  }, [showToast]);

  // Core reload
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
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentCountry, currentDays, showToast]);

  // Trigger reload on filter change
  useEffect(() => {
    if (countries.length) reload();
  }, [countries, reload]);

  // --- 1) Navbar refresh button handler ---
  const onNavRefresh = () => {
    setCurrentCountry('global');
    reload();
    showToast('Data refreshed', 'success');
  };

  // --- 2) Keyboard shortcuts (including Ctrl+R) ---
  useKeyboardShortcuts([
  {
    key: 'r',
    ctrl: true,
    handler: () => {
      setCurrentCountry('global');
      reload();
      showToast('Data refreshed (country reset to Global)', 'info');
    }
  },
  {
    key: 'e',
    ctrl: true,
    handler: () => exportData(lastData, currentCountry)
  },
  {
    key: 'd',
    ctrl: true,
    handler: () => {
      const next = !darkMode;
      setDarkMode(next);
      showToast(`${next ? 'Dark' : 'Light'} mode enabled`, 'info');
    }
  },
  {
    key: 'f',
    ctrl: true,
    handler: () => {
      const input = document.querySelector('input[type="search"], input#search');
      if (input) {
        input.focus();
        input.select();
        showToast('Focused search input', 'info');
      } else {
        showToast('Search input not found', 'warning');
      }
    }
  },
  {
    key: 'h',
    ctrl: true,
    handler: () => {
      showKeyboardShortcuts();
    }
  },
  {
    key: 'Escape',
    handler: () => {
      setShowComparison(false);
      setShowHotspots(false);
      setShowPredictions(false);
    }
  }
]);


  // --- 3) Auto-refresh every 5 mins ---
  useAutoRefresh(() => {
    setCurrentCountry('global');
    reload();
    showToast('Auto-refreshed data (country reset to Global)', 'info');
  }, 5 * 60 * 1000);

  // Export
  const handleExport = async () => {
    if (!lastData) {
      showToast('No data to export', 'warning');
      return;
    }
    try {
      await exportData(lastData, currentCountry);
      showToast('Data exported successfully', 'success');
    } catch {
      showToast('Failed to export data', 'error');
    }
  };

  // Shortcut help
  const showKeyboardShortcuts = () => {
  if (document.getElementById('shortcuts-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'shortcuts-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
      <h3 class="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
      <div class="space-y-2 text-sm">
        <div><kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl+R</kbd> Refresh data</div>
        <div><kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl+E</kbd> Export data</div>
        <div><kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl+D</kbd> Toggle mode</div>
        <div><kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl+F</kbd> Focus search</div>
        <div><kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl+H</kbd> Show shortcuts</div>
        <div><kbd class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Esc</kbd> Close modals</div>
      </div>
      <button 
        class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        onclick="document.getElementById('shortcuts-modal')?.remove()"
      >
        Close
      </button>
    </div>
  `;

  // Remove modal when clicking outside content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
};

  return (
    <ErrorBoundary>
      <div className="w-screen min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <Navbar
          darkMode={darkMode}
          toggleTheme={() => {
            const next = !darkMode;
            setDarkMode(next);
            showToast(`${next ? 'Dark' : 'Light'} mode enabled`, 'info');
          }}
          onRefresh={onNavRefresh}
        />

        <main className="w-full px-4 py-6 space-y-6">
          <Filters
            countries={countries}
            currentCountry={currentCountry}
            currentDays={currentDays}
            onCountryChange={setCurrentCountry}
            onDaysChange={setCurrentDays}
            onCompare={() => setShowComparison(v => !v)}
            onHotspots={() => setShowHotspots(v => !v)}
            onPredictions={() => {
              if (currentCountry === 'global') {
                showToast('Select a country before running predictions', 'warning');
              } else {
                setShowPredictions(v => !v);
              }
            }}
            onExport={handleExport}
            showToast={showToast}
          />

          {lastData && (
            <>
              <StatsCards stats={lastData.stats} />
              {lastData.stats.analysis && <AnalysisSummary analysis={lastData.stats.analysis} />}
            </>
          )}

          <ChartsSection data={lastData} country={currentCountry} countries={countries} />

          {showComparison   && <ComparisonSection countries={countries} showToast={showToast} />}
          {showHotspots     && <HotspotsSection showToast={showToast} />}
          {showPredictions && currentCountry !== 'global' && (
            <PredictionsSection country={currentCountry} showToast={showToast} />
          )}

          <DataTable
            countries={countries}
            onViewDetails={c => {
              setCurrentCountry(c);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showToast={showToast}
          />
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
