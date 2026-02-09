import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const OrderHistory = ({ socket, onShowNotification }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(true);

  const loadOrders = (phone) => {
    setLoading(true);
    socket.emit('getMyOrders', { customerPhone: phone }, (response) => {
      setLoading(false);
      if (response.success) {
        setOrders(response.orders);
        setShowPhoneInput(false);
        localStorage.setItem('customerPhone', phone);
      } else {
        onShowNotification('Failed to load orders', 'error');
      }
    });
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem('customerPhone');
    if (savedPhone) {
      setCustomerPhone(savedPhone);
      loadOrders(savedPhone);
    } else {
      setLoading(false);
    }
  }, [socket]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      onShowNotification('Please enter your phone number', 'error');
      return;
    }
    loadOrders(customerPhone);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      preparing: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Preparing' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ready' },
      out_for_delivery: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'On the Way' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => {
        if (filterStatus === 'active') {
          return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
        }
        if (filterStatus === 'completed') {
          return order.status === 'delivered';
        }
        if (filterStatus === 'cancelled') {
          return order.status === 'cancelled';
        }
        return true;
      });

  if (showPhoneInput) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">View Your Orders</h2>
              <p className="text-gray-600">Enter your phone number to see your order history</p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
              >
                View My Orders
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition"
              >
                Back to Menu
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <button
            onClick={() => {
              localStorage.removeItem('customerPhone');
              setShowPhoneInput(true);
              setOrders([]);
            }}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Change Phone
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: 'all', label: 'All Orders', count: orders.length },
            { key: 'active', label: 'Active', count: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length },
            { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'delivered').length },
            { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filterStatus === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 cursor-pointer"
                onClick={() => navigate(`/track/${order.orderId}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{order.orderId}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{order.items.length} items</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span>{item.image}</span>
                      <span>{item.quantity}x {item.name}</span>
                      {idx < Math.min(order.items.length - 1, 2) && <span>•</span>}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span>+ {order.items.length - 3} more</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-sm text-gray-600">
                    {order.estimatedTime && !['delivered', 'cancelled'].includes(order.status) && (
                      `Estimated: ${order.estimatedTime} min`
                    )}
                  </span>
                  <span className="text-blue-600 font-medium text-sm">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;