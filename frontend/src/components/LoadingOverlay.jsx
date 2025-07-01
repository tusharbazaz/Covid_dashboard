const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-virus text-blue-500 text-lg animate-pulse"></i>
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-300">Loading data...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;