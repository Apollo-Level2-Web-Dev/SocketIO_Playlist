import { useNavigate } from "react-router";

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1;
  const deliveryFee = 5.0;
  const total = subtotal + tax + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some delicious items to get started!
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={onClearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-4 sm:p-5 hover:shadow-lg transition"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Item Image */}
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 w-full sm:w-24 h-40 sm:h-24 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-4xl">{item.image}</span>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {item.description}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="sm:hidden text-red-500 hover:text-red-700 font-bold text-xl px-2"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-xl font-bold text-blue-600 mb-2 sm:mb-0">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 sm:gap-0 mt-2 sm:mt-0">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="hidden sm:block text-red-500 hover:text-red-700 font-bold text-xl"
                    >
                      ×
                    </button>

                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="text-gray-700 hover:text-gray-900 font-bold text-xl w-8 h-8 flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="font-bold text-lg w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="text-gray-700 hover:text-gray-900 font-bold text-xl w-8 h-8 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-lg font-bold text-gray-800 ml-auto sm:ml-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
