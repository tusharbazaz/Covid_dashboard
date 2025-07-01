import { useState, useEffect } from 'react';

const Navbar = ({ darkMode, toggleTheme, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Add keyboard shortcut for refresh
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <i className="fas fa-virus text-2xl text-blue-500 animate-pulse"></i>
            <h1 className="text-xl font-bold">COVID-19 Analytics Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefresh}
              className={`p-2  hover:bg-gray-100  dark:hover:bg-gray-700 rounded-lg transition
                       ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh data (Ctrl+R)"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100  dark:hover:bg-gray-700 rounded-lg transition"
              title="Toggle dark mode (Ctrl+D)"
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button
              onClick={() => window.open('https://github.com/tusharbazaz', '_blank')}
              className="p-2 hover:bg-gray-100  dark:hover:bg-gray-700 rounded-lg transition hidden sm:block"
              title="View on GitHub"
            >
              <i className="fab fa-github"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;