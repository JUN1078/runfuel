import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <span className="icon-[tabler--mail-check] mx-auto mb-3 text-4xl text-[var(--color-primary)]" />
        <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          If an account exists for {email}, we sent a reset link.
        </p>
        <Link to="/login" className="text-[var(--color-primary)]">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Reset Password</h2>
      <p className="text-sm text-[var(--color-text-muted)]">
        Enter your email and we'll send you a reset link.
      </p>
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
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-center">
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      <Link to="/login" className="block text-center text-sm text-[var(--color-text-muted)]">
        Back to login
      </Link>
    </form>
  );
}
