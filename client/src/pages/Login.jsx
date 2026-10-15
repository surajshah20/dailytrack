import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-7 h-7 text-primary-500" />
          <span className="text-xl font-bold tracking-tight text-white">DailyTrack</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-sm text-gray-400 mb-6">Plan your day, log your hours, and track progress.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}