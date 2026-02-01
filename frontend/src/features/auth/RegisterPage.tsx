import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import apiClient from '../../api/client';
import type { User } from '../../types/user';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { data: tokens } = await authApi.register({ email, password });
      setTokens(tokens.access_token, tokens.refresh_token);

      const { data: user } = await apiClient.get<User>('/api/v1/users/me');
      setUser(user);

      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Email</label>
        <div className="input-with-icon">
          <span className="input-icon icon-[tabler--mail]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="runner@example.com"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Password</label>
        <div className="input-with-icon">
          <span className="input-icon icon-[tabler--lock]" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Min. 8 characters"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">Confirm Password</label>
        <div className="input-with-icon">
          <span className="input-icon icon-[tabler--lock-check]" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Repeat password"
          />
        </div>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-center">
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
          Log in
        </Link>
      </p>
    </form>
  );
}
