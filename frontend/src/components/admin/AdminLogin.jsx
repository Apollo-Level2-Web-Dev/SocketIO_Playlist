import { useState } from 'react';
import ConnectionStatus from '../common/ConnectionStatus';

const AdminLogin = ({ socket, onLoginSuccess, onShowNotification }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password.trim()) {
      onShowNotification('Please enter password', 'error');
      return;
    }

    setLoading(true);

    socket.emit('adminLogin', { password }, (response) => {
      setLoading(false);

      if (response.success) {
        onShowNotification('Login successful! Welcome Admin 👨‍💼', 'success');
        localStorage.setItem('isAdmin', 'true');
        onLoginSuccess();
      } else {
        onShowNotification(response.message || 'Invalid password', 'error');
        setPassword('');
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <ConnectionStatus connected={socket?.connected} isFixed={true} />
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👨‍💼</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
            <p className="text-gray-600">Enter password to access dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              💡 For testing: password is <code className="bg-white px-2 py-1 rounded font-mono text-xs">admin123</code>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;