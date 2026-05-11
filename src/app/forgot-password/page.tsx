'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to send reset email');
      return;
    }

    setMessage(data.message ?? 'If an account exists for that email, a reset link has been sent.');
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
          Forgot password?
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-full border-slate-200 bg-orange-50/70 pl-11 text-sm focus-visible:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-orange-600 font-bold tracking-wider text-white shadow-lg shadow-orange-200 hover:bg-orange-700 dark:shadow-none"
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
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
