
const ConnectionStatus = ({ connected, isFixed = false }) => {
  const containerClasses = isFixed
    ? "fixed top-4 right-4 z-50 shadow-lg"
    : "inline-flex shadow-sm";

  return (
    <div className={`${containerClasses} flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200`}>
      <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      <span className="text-sm font-medium text-gray-700">
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;