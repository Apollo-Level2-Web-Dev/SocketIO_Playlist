/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import OrderDetail from './OrderDetail';
import ConnectionStatus from '../common/ConnectionStatus';

const AdminDashboard = ({ socket, onShowNotification, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    loadOrders();
    loadStats();

    // Listen for real-time updates
    socket.on('newOrder', (data) => {
      setOrders(prev => [data.order, ...prev]);
      onShowNotification(`🔔 New order: ${data.order.orderId}`, 'info');
      loadStats();
      // Play sound
      new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77FeCg==').play().catch(() => {});
    });

    socket.on('orderStatusChanged', () => {
      loadOrders();
      loadStats();
    });

    socket.on('orderCancelled', (data) => {
      onShowNotification(`Order ${data.orderId} was cancelled`, 'warning');
      loadOrders();
      loadStats();
    });

    return () => {
      socket.off('newOrder');
      socket.off('orderStatusChanged');
      socket.off('orderCancelled');
    };
  }, [socket]);

  const loadOrders = () => {
    setLoading(true);
    socket.emit('getAllOrders', {}, (response) => {
      setLoading(false);
      if (response.success) {
        setOrders(response.orders);
      } else {
        onShowNotification('Failed to load orders', 'error');
      }
    });
  };

  const loadStats = () => {
    socket.emit('getLiveStats', (response) => {
      if (response.success) {
        setStats(response.stats);
      }
    });
  };

  const handleAcceptOrder = (order) => {
    const time = prompt('Enter estimated time (minutes):', '30');
    if (!time) return;

    const estimatedTime = parseInt(time);
    if (isNaN(estimatedTime) || estimatedTime < 5) {
      onShowNotification('Please enter a valid time', 'error');
      return;
    }

    socket.emit('acceptOrder', { orderId: order.orderId, estimatedTime }, (response) => {
      if (response.success) {
        onShowNotification(`Order ${order.orderId} accepted!`, 'success');
        loadOrders();
        loadStats();
      } else {
        onShowNotification(response.message || 'Failed to accept order', 'error');
      }
    });
  };

  const handleRejectOrder = (order) => {
    const reasons = [
      'Out of ingredients',
      'Kitchen at capacity',
      'Outside delivery area',
      'Payment issue',
      'Other'
    ];

    const reasonIndex = prompt(`Select reason:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nEnter number (1-${reasons.length}):`);
    
    if (!reasonIndex) return;

    const index = parseInt(reasonIndex) - 1;
    let reason = reasons[index] || 'Other';

    if (reason === 'Other') {
      reason = prompt('Enter custom reason:');
      if (!reason) return;
    }

    socket.emit('rejectOrder', { orderId: order.orderId, reason }, (response) => {
      if (response.success) {
        onShowNotification(`Order ${order.orderId} rejected`, 'success');
        loadOrders();
        loadStats();
      } else {
        onShowNotification(response.message || 'Failed to reject order', 'error');
      }
    });
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    socket.emit('updateOrderStatus', { orderId, newStatus }, (response) => {
      if (response.success) {
        onShowNotification(`Status updated to ${newStatus}`, 'success');
        loadOrders();
        loadStats();
      } else {
        onShowNotification(response.message || 'Failed to update status', 'error');
      }
    });
  };

  const filterOrders = (status) => {
    if (status === 'pending') {
      return orders.filter(o => o.status === 'pending');
    }
    if (status === 'active') {
      return orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status));
    }
    if (status === 'delivery') {
      return orders.filter(o => o.status === 'out_for_delivery');
    }
    if (status === 'completed') {
      return orders.filter(o => o.status === 'delivered');
    }
    if (status === 'cancelled') {
      return orders.filter(o => o.status === 'cancelled');
    }
    return orders;
  };

  const filteredOrders = filterOrders(activeTab);

  const tabs = [
    { key: 'pending', label: 'Pending', icon: '⏳', color: 'bg-yellow-500' },
    { key: 'active', label: 'In Progress', icon: '🔄', color: 'bg-blue-500' },
    { key: 'delivery', label: 'Delivery', icon: '🚗', color: 'bg-purple-500' },
    { key: 'completed', label: 'Completed', icon: '✓', color: 'bg-green-500' },
    { key: 'cancelled', label: 'Cancelled', icon: '✕', color: 'bg-red-500' }
  ];

  // Helper for stats cards
  const StatCard = ({ label, value, color, icon }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{label}</p>
        <span className={`w-8 h-8 flex items-center justify-center rounded-lg ${color} bg-opacity-10 text-lg opacity-80 group-hover:scale-110 transition-transform`}>
           {icon}
        </span>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:h-20 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30 text-white shrink-0">
                👨‍💼
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide">REAL-TIME OVERVIEW</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 justify-end">
              <ConnectionStatus connected={socket?.connected} />
              
              <button
                onClick={loadOrders}
                className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95"
                title="Refresh"
              >
                <span className="text-xl">🔄</span>
              </button>
              <button
                onClick={onLogout}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 animate-enter">
            <StatCard label="Today's Orders" value={stats.totalToday} color="text-indigo-600 bg-indigo-600" icon="📅" />
            <StatCard label="Pending" value={stats.pending} color="text-amber-500 bg-amber-500" icon="⏳" />
            <StatCard label="In Kitchen" value={stats.preparing + stats.confirmed} color="text-orange-500 bg-orange-500" icon="🍳" />
            <StatCard label="Delivered" value={stats.delivered} color="text-emerald-500 bg-emerald-500" icon="✓" />
          </div>
        )}

        {/* Tabs and Content */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 sticky top-24 z-30 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex md:flex-col gap-1 min-w-max md:min-w-0">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="text-lg opacity-80">{tab.icon}</span>
                  <span className="flex-1">{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                     activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {filterOrders(tab.key).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Fetching orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center animate-enter">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 text-slate-300">
                  🍃
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">All caught up!</h3>
                <p className="text-slate-500">No orders in this category right now.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 animate-enter">
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onViewDetails={setSelectedOrder}
                    onAccept={handleAcceptOrder}
                    onReject={handleRejectOrder}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          socket={socket}
          onShowNotification={onShowNotification}
        />
      )}
    </div>
  );
};

export default AdminDashboard;