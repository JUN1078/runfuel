import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import apiClient from '../../api/client';
import type { User } from '../../types/user';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: tokens } = await authApi.login({ email, password });
      setTokens(tokens.access_token, tokens.refresh_token);

      const { data: user } = await apiClient.get<User>('/api/v1/users/me');
      setUser(user);

      navigate(user.has_profile ? '/dashboard' : '/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          placeholder="runner@example.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-[var(--color-surface-light)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          placeholder="Min. 8 characters"
        />
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <div className="flex justify-between text-sm">
        <Link to="/forgot-password" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          Forgot password?
        </Link>
        <Link to="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
          Create account
        </Link>
      </div>
    </form>
  );
}
