'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function readTokenFromUrl() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token') ?? '';
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token] = useState(readTokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('Reset token is missing. Please request a new password reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to reset password');
      return;
    }

    setSuccess(true);
    window.setTimeout(() => router.push('/login'), 1200);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        <Link href="/" className="mb-8 inline-flex">
          <img
            src="/all-in-one-seo-audit-logo.png"
            alt="All In One SEO Audit Tool"
            className="h-14 w-auto max-w-[210px] object-contain"
          />
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Create new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Choose a strong password with at least 10 characters.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-full border-slate-200 bg-orange-50/70 pl-11 text-sm focus-visible:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
              required
              minLength={10}
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-12 rounded-full border-slate-200 bg-orange-50/70 pl-11 text-sm focus-visible:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
              required
              minLength={10}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Password updated. Redirecting to login...
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || success}
            className="h-12 w-full rounded-full bg-orange-600 font-bold tracking-wider text-white shadow-lg shadow-orange-200 hover:bg-orange-700 dark:shadow-none"
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {loading ? 'UPDATING...' : 'RESET PASSWORD'}
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </section>
    </main>
  );
}
