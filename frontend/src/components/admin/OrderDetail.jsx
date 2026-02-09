import { useState } from "react";

const OrderDetail = ({ order, onClose, socket, onShowNotification }) => {
  const [estimatedTime, setEstimatedTime] = useState(order.estimatedTime || 30);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSetTime = () => {
    socket.emit(
      "setEstimatedTime",
      { orderId: order.orderId, estimatedTime },
      (response) => {
        if (response.success) {
          onShowNotification(
            `Time updated to ${estimatedTime} minutes`,
            "success",
          );
        } else {
          onShowNotification(
            response.message || "Failed to update time",
            "error",
          );
        }
      },
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Pending",
      },
      confirmed: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        label: "Confirmed",
      },
      preparing: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      label: "Preparing",
      ready: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        label: "Ready",
      },
      out_for_delivery: {
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
        label: "On the Way",
      },
      delivered: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Delivered",
      },
      cancelled: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        label: "Cancelled",
      },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`px-4 py-1.5 rounded-full text-sm font-bold border ${badge.bg} ${badge.text} ${badge.border} shadow-sm`}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-white/50">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Order Details
            </h2>
            <p className="text-slate-500 font-mono text-sm mt-0.5">
              {order.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          {/* Status & Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Sort Status
              </p>
              {getStatusBadge(order.status)}
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Order Time
              </p>
              <p className="font-bold text-slate-800 text-lg flex items-center gap-2">
                📅 {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-linear-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl p-6 border border-indigo-100/50">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                👤
              </span>
              Customer Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Name
                </p>
                <p className="font-bold text-slate-700 text-lg">
                  {order.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Contact
                </p>
                <p className="font-bold text-slate-700 text-lg">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Delivery Address
                </p>
                <p className="font-medium text-slate-700 leading-relaxed bg-white/60 p-3 rounded-xl border border-white/50">
                  {order.customerAddress}
                </p>
              </div>
              {order.specialNotes && (
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Special Notes
                  </p>
                  <p className="font-medium text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm">
                    <span className="text-xl">📝</span>
                    {order.specialNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                🛍️
              </span>
              Order Items
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        {item.image || "🍔"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-md min-w-[24px] text-center">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-slate-800">
                            {item.name}
                          </span>
                        </div>
                        {item.specialInstructions && (
                          <p className="text-sm text-slate-500 mt-1 pl-1 border-l-2 border-slate-200 ml-1 italic">
                            "{item.specialInstructions}"
                          </p>
                        )}
                        <p className="text-xs font-bold text-slate-400 mt-1 ml-1">
                          @ ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800 text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-slate-50/80 p-6 space-y-3 border-t border-slate-200">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Tax (10%)</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Delivery Fee</span>
                  <span className="font-medium">
                    ${order.deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 text-slate-800 border-t border-slate-200 mt-2">
                  <span>Total Due</span>
                  <span className="text-indigo-600">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">
                💳
              </span>
              Payment Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Method
                </p>
                <p className="font-bold text-slate-700 capitalize flex items-center gap-2">
                  {order.paymentMethod === "card" ? "💳" : "💵"}{" "}
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </p>
                <p
                  className={`font-bold capitalize inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm
                  ${order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {order.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
                </p>
              </div>
            </div>
          </div>

          {/* Estimated Time Control */}
          {!["delivered", "cancelled"].includes(order.status) && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                  ⏱️
                </span>
                Delivery Estimate
              </h3>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() =>
                      setEstimatedTime(Math.max(5, estimatedTime - 5))
                    }
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all text-xl"
                  >
                    -
                  </button>
                  <div className="w-24 text-center">
                    <span className="text-2xl font-bold text-slate-800">
                      {estimatedTime}
                    </span>
                    <span className="text-xs font-bold text-slate-400 block uppercase">
                      MINS
                    </span>
                  </div>
                  <button
                    onClick={() => setEstimatedTime(estimatedTime + 5)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all text-xl"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleSetTime}
                  className="flex-1 w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                >
                  Update Estimate
                </button>
              </div>
            </div>
          )}

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-sm">
                  📜
                </span>
                History
              </h3>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-2">
                {[...order.statusHistory].reverse().map((history, index) => (
                  <div key={index} className="relative pl-6">
                    <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm ring-1 ring-slate-200"></span>
                    <div>
                      <p className="font-bold text-slate-800 capitalize text-base">
                        {history.status.replace("_", " ")}
                      </p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                        {formatDate(history.timestamp)}
                      </p>
                      {history.note && (
                        <div className="mt-2 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 inline-block shadow-sm">
                          {history.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-xl font-bold shadow-sm transition-all text-sm uppercase tracking-wide"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
