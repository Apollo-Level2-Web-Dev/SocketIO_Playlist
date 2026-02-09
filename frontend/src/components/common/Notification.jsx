import { useEffect } from 'react';

const Notification = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type] || 'bg-gray-500';

  return (
    <div className={`fixed top-20 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in max-w-md`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'info' && 'ℹ'}
          {type === 'warning' && '⚠'}
        </span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 font-bold text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;