import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <span className="icon-[tabler--circle-check] mx-auto mb-3 text-4xl text-[var(--color-primary)]" />
        <h2 className="mb-2 text-xl font-semibold">Password Reset</h2>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Your password has been updated. You can now log in.
        </p>
        <Link to="/login" className="text-[var(--color-primary)]">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">New Password</h2>
      <div className="input-with-icon">
        <span className="input-icon icon-[tabler--lock]" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="New password"
        />
      </div>
      <div className="input-with-icon">
        <span className="input-icon icon-[tabler--lock-check]" />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm new password"
        />
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-center">
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
