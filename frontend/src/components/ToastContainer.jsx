import { useEffect, useState } from 'react';

const Toast = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onRemove, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div 
      className={`
        p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm text-white
        ${colors[toast.type] || colors.info}
        ${isExiting ? 'toast-exit' : 'toast-enter'}
      `}
    >
      <i className={`fas ${icons[toast.type] || icons.info}`}></i>
      <span className="flex-1">{toast.message}</span>
      <button 
        onClick={() => {
          setIsExiting(true);
          setTimeout(onRemove, 300);
        }}
        className="ml-auto hover:opacity-80 transition-opacity"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={() => {}} 
        />
      ))}
    </div>
  );
};

export default ToastContainer;