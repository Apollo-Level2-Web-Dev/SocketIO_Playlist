import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import ConnectionStatus from './ConnectionStatus';

const Header = ({ cartCount = 0, showCart = true, showAdmin = true, connected }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-3xl">🍕</span>
            <div>
              <h1 className="text-xl font-bold">FoodTrack</h1>
              <p className="text-xs text-blue-200">Real-time Order Tracking</p>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Cart - Always Visible */}
            {showCart && (
              <button
                onClick={() => navigate('/cart')}
                className="relative hover:bg-blue-500 px-3 py-2 rounded-lg transition"
              >
                <span className="text-2xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <ConnectionStatus connected={connected} />

              {showAdmin && (
                <Link
                  to="/admin"
                  className="hover:bg-blue-500 px-4 py-2 rounded-lg transition font-medium"
                >
                  👨‍💼 Admin
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-500 transition text-2xl"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 p-4 flex flex-col gap-4 animate-fade-in text-gray-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-500">Status</span>
              <ConnectionStatus connected={connected} />
            </div>

            {showAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition font-medium text-gray-700"
              >
                <span>👨‍💼</span>
                <span>Admin Dashboard</span>
              </Link>
            )}
            
            <button
               onClick={() => { setIsMenuOpen(false); navigate('/'); }}
               className="text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition text-gray-600"
            >
              Home
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;