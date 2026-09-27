'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function PasswordGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-membership-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Invalid password.');
      }
    } catch (err) {
      setError('An error occurred while verifying the password.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <Lock size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center">Membership Application Access</h2>
        <p className="text-sm text-gray-500 text-center mt-2">
          Please enter the Membership Password provided by the administrator to access the application form.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm text-center border border-red-200">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Membership Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Enter password..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-center items-center"
        >
          {loading ? 'Verifying...' : 'Access Form'}
        </button>
      </form>
    </div>
  );
}
