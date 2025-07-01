const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="loading h-6 w-32 mb-4"></div>
            <div className="loading h-32"></div>
          </div>
        );
        
      case 'stat':
        return (
          <div className="stat-card loading h-32"></div>
        );
        
      case 'table-row':
        return (
          <tr className="border-b dark:border-gray-700">
            <td className="p-3">
              <div className="flex items-center space-x-2">
                <div className="loading h-4 w-6 rounded"></div>
                <div className="loading h-4 w-24"></div>
              </div>
            </td>
            <td className="p-3"><div className="loading h-4 w-16 ml-auto"></div></td>
            <td className="p-3"><div className="loading h-4 w-16 ml-auto"></div></td>
            <td className="p-3"><div className="loading h-4 w-16 ml-auto"></div></td>
            <td className="p-3"><div className="loading h-4 w-16 ml-auto"></div></td>
            <td className="p-3">
              <div className="flex justify-center space-x-2">
                <div className="loading h-6 w-6 rounded"></div>
                <div className="loading h-6 w-6 rounded"></div>
              </div>
            </td>
          </tr>
        );
        
      case 'analysis':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="loading h-8 w-8 rounded-full"></div>
            <div>
              <div className="loading h-3 w-20 mb-2"></div>
              <div className="loading h-5 w-16"></div>
            </div>
          </div>
        );
        
      default:
        return <div className="loading h-32"></div>;
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;