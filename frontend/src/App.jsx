/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { useSocket } from './hooks/useSocket';

// Common Components
import Notification from './components/common/Notification';
import Header from './components/common/Header';

// Customer Components
import Menu from './components/customer/Menu';
import Cart from './components/customer/Cart';
import OrderForm from './components/customer/OrderForm';
import OrderTracking from './components/customer/OrderTracking';
import OrderHistory from './components/customer/OrderHistory';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const { socket, connected } = useSocket();
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }

    // Check admin login status
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Cart functions
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
      showNotification(`Added another ${item.name} to cart`, 'success');
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
      showNotification(`${item.name} added to cart`, 'success');
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    showNotification('Item removed from cart', 'info');
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCart([]);
      showNotification('Cart cleared', 'info');
    }
  };

  // Admin functions
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdminLoggedIn(false);
    showNotification('Logged out successfully', 'success');
  };

  return (
    <Router>
      <div className="min-h-screen text-slate-800">
        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <Routes>
          {/* Customer Routes */}
          <Route
            path="/"
            element={
              <>
                <Header cartCount={cart.length} connected={connected} />
                <Menu onAddToCart={addToCart} />
              </>
            }
          />

          <Route
            path="/cart"
            element={
              <>
                <Header cartCount={cart.length} connected={connected} />
                <Cart
                  cart={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onClearCart={clearCart}
                />
              </>
            }
          />

          <Route
            path="/checkout"
            element={
              <>
                <Header cartCount={cart.length} connected={connected} />
                <OrderForm
                  cart={cart}
                  socket={socket}
                  onShowNotification={showNotification}
                />
              </>
            }
          />

          <Route
            path="/track/:orderId"
            element={
              <>
                <Header cartCount={cart.length} connected={connected} />
                <OrderTracking
                  socket={socket}
                  onShowNotification={showNotification}
                />
              </>
            }
          />

          <Route
            path="/orders"
            element={
              <>
                <Header cartCount={cart.length} connected={connected} />
                <OrderHistory
                  socket={socket}
                  onShowNotification={showNotification}
                />
              </>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              isAdminLoggedIn ? (
                <AdminDashboard
                  socket={socket}
                  onShowNotification={showNotification}
                  onLogout={handleAdminLogout}
                />
              ) : (
                <AdminLogin
                  socket={socket}
                  onLoginSuccess={handleAdminLogin}
                  onShowNotification={showNotification}
                />
              )
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;