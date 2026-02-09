import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

const OrderTracking = ({ socket, onShowNotification }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !orderId) return;

    // Track order
    socket.emit('trackOrder', { orderId }, (response) => {
      setLoading(false);
      if (response.success) {
        setOrder(response.order);
      } else {
        onShowNotification(response.message || 'Order not found', 'error');
        setTimeout(() => navigate('/'), 2000);
      }
    });

    // Listen for real-time updates
    const handleStatusUpdate = (data) => {
      if (data.orderId === orderId) {
        setOrder(data.order);
        onShowNotification(`Status updated: ${getStatusMessage(data.status)}`, 'info');
      }
    };

    const handleOrderAccepted = (data) => {
      if (data.orderId === orderId) {
        onShowNotification(`Order confirmed! Ready in ${data.estimatedTime} minutes`, 'success');
        // Reload order data
        socket.emit('trackOrder', { orderId }, (response) => {
          if (response.success) setOrder(response.order);
        });
      }
    };

    const handleOrderRejected = (data) => {
      if (data.orderId === orderId) {
        onShowNotification(`Order rejected: ${data.reason}`, 'error');
        socket.emit('trackOrder', { orderId }, (response) => {
          if (response.success) setOrder(response.order);
        });
      }
    };

    const handleOrderCancelled = (data) => {
      if (data.orderId === orderId) {
        onShowNotification('Order has been cancelled', 'warning');
        socket.emit('trackOrder', { orderId }, (response) => {
          if (response.success) setOrder(response.order);
        });
      }
    };

    const handleTimeUpdated = (data) => {
      if (data.orderId === orderId) {
        onShowNotification(`Updated: Ready in ${data.estimatedTime} minutes`, 'info');
        socket.emit('trackOrder', { orderId }, (response) => {
          if (response.success) setOrder(response.order);
        });
      }
    };

    socket.on('statusUpdated', handleStatusUpdate);
    socket.on('orderAccepted', handleOrderAccepted);
    socket.on('orderRejected', handleOrderRejected);
    socket.on('orderCancelled', handleOrderCancelled);
    socket.on('estimatedTimeUpdated', handleTimeUpdated);

    return () => {
      socket.off('statusUpdated', handleStatusUpdate);
      socket.off('orderAccepted', handleOrderAccepted);
      socket.off('orderRejected', handleOrderRejected);
      socket.off('orderCancelled', handleOrderCancelled);
      socket.off('estimatedTimeUpdated', handleTimeUpdated);
    };
  }, [socket, orderId, navigate, onShowNotification]);

  const getStatusMessage = (status) => {
    const messages = {
      pending: 'Waiting for restaurant confirmation...',
      confirmed: 'Your order has been confirmed!',
      preparing: 'Your food is being prepared',
      ready: 'Your order is ready!',
      out_for_delivery: 'Driver is on the way',
      delivered: 'Delivered! Enjoy your meal!',
      cancelled: 'Order was cancelled'
    };
    return messages[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      preparing: 'bg-orange-500',
      ready: 'bg-green-500',
      out_for_delivery: 'bg-purple-500',
      delivered: 'bg-green-600',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✓' },
    { key: 'preparing', label: 'Preparing', icon: '🍳' },
    { key: 'ready', label: 'Ready', icon: '✓' },
    { key: 'out_for_delivery', label: 'On the Way', icon: '🚗' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const handleCancelOrder = () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    const reason = prompt('Reason for cancellation (optional):') || 'No reason provided';

    socket.emit('cancelOrder', { orderId, reason }, (response) => {
      if (response.success) {
        onShowNotification('Order cancelled successfully', 'success');
      } else {
        onShowNotification(response.message || 'Failed to cancel order', 'error');
      }
    });
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    onShowNotification('Order ID copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600">Order not found</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Tracking</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Order ID:</span>
                <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">{orderId}</code>
                <button
                  onClick={copyOrderId}
                  className="text-blue-600 hover:text-blue-700"
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Menu
            </button>
          </div>

          {/* Current Status */}
          <div className={`${getStatusColor(order.status)} text-white p-4 rounded-lg`}>
            <p className="text-2xl font-bold">{getStatusMessage(order.status)}</p>
            {order.estimatedTime && !['delivered', 'cancelled'].includes(order.status) && (
              <p className="text-lg mt-2">Estimated time: {order.estimatedTime} minutes</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Progress</h2>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                        index <= currentStepIndex
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center max-w-20">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Details</h2>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.image}</span>
                  <div>
                    <p className="font-medium">{item.quantity}x {item.name}</p>
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-600">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                </div>
                <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-blue-600">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{order.customerAddress}</p>
            </div>
            {order.specialNotes && (
              <div>
                <p className="text-sm text-gray-600">Special Notes</p>
                <p className="font-medium">{order.specialNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Button */}
        {canCancel && (
          <div className="text-center">
            <button
              onClick={handleCancelOrder}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;