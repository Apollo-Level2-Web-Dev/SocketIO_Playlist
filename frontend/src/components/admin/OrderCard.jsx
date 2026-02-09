
const OrderCard = ({ order, onViewDetails, onAccept, onReject, onUpdateStatus }) => {
  // Revised status colors (softer, fresher)
  const getStatusColor = (status) => {
    const colors = {
      pending: 'border-l-amber-400 bg-amber-50/50',
      confirmed: 'border-l-indigo-500 bg-indigo-50/50',
      preparing: 'border-l-orange-500 bg-orange-50/50',
      ready: 'border-l-green-500 bg-green-50/50',
      out_for_delivery: 'border-l-violet-500 bg-violet-50/50',
      delivered: 'border-l-emerald-600 bg-emerald-50/50',
      cancelled: 'border-l-rose-500 bg-rose-50/50'
    };
    return colors[status] || 'border-l-slate-400 bg-slate-50/50';
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 h ago';
    if (diffHours < 24) return `${diffHours} h ago`;

    return new Date(dateString).toLocaleDateString();
  };

  const getNextStatuses = (currentStatus) => {
    const transitions = {
      confirmed: ['preparing'],
      preparing: ['ready'],
      ready: ['out_for_delivery'],
      out_for_delivery: ['delivered']
    };
    return transitions[currentStatus] || [];
  };

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className={`glass-card hover:-translate-y-1 transition-all duration-300 border-l-[6px] ${getStatusColor(order.status)} p-6 flex flex-col h-full`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">#{order.orderId.slice(-6)}</h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            ⏱ {getTimeAgo(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            ${order.totalAmount.toFixed(2)}
          </p>
          <p className="text-xs font-medium text-slate-400">{order.items.length} items</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-5 pb-5 border-b border-slate-100 space-y-2">
        <div className="flex items-start gap-2">
          <span className="min-w-[1.25rem] text-center text-slate-400">👤</span>
          <div>
            <p className="font-semibold text-slate-700 text-sm leading-tight">{order.customerName}</p>
            <p className="text-xs text-slate-500">{order.customerPhone}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
           <span className="min-w-[1.25rem] text-center text-slate-400">📍</span>
           <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{order.customerAddress}</p>
        </div>
      </div>

      {/* Items Preview */}
      <div className="mb-6 flex-1">
        <div className="space-y-2">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/50 border border-slate-100">
              <span className="text-slate-700 font-medium">
                <span className="text-indigo-600 font-bold mr-2">{item.quantity}x</span> 
                {item.name}
              </span>
              <span className="text-slate-500 text-xs font-mono">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-center text-xs font-bold text-slate-400 mt-2 bg-slate-50 py-1 rounded-md">
              + {order.items.length - 2} more items
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        {/* Pending Order Actions */}
        {order.status === 'pending' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onAccept(order)}
              className="bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-green-500/20 shadow-lg active:scale-95 transition-all"
            >
              ✓ Accept
            </button>
            <button
              onClick={() => onReject(order)}
              className="bg-white hover:bg-red-50 text-red-500 border border-red-100 hover:border-red-200 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all"
            >
              Reject
            </button>
          </div>
        )}

        {/* Status Update Dropdown */}
        {nextStatuses.length > 0 && (
          <div className="relative">
             <select
              onChange={(e) => onUpdateStatus(order.orderId, e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
              defaultValue=""
            >
              <option value="" disabled>Update Status</option>
              {nextStatuses.map(status => (
                <option key={status} value={status}>
                  Make {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500 text-xs">
              ▼
            </div>
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={() => onViewDetails(order)}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
        >
          View Details
        </button>
      </div>

      {/* Estimated Time Badge */}
      {order.estimatedTime && !['delivered', 'cancelled'].includes(order.status) && (
        <div className="mt-4 flex justify-center">
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5 shadow-sm">
            ⏱️ {order.estimatedTime} min remaining
          </span>
        </div>
      )}
    </div>
  );
};

export default OrderCard;