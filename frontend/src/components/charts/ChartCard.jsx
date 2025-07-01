import { useRef, useEffect } from 'react';
import { useChartResize } from '../../hooks/useChartResize';

const ChartCard = ({ 
  title, 
  subtitle, 
  children, 
  controls, 
  className = '',
  loading = false,
  error = null 
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current && !loading && !error) {
      // Add animation class when content loads
      cardRef.current.classList.add('fade-in');
    }
  }, [loading, error]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <div ref={cardRef} className={`card ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {controls && <div>{controls}</div>}
      </div>
      {renderContent()}
    </div>
  );
};

export default ChartCard;