'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? 'Login failed');
      return;
    }

    router.push(data.user?.role === 'admin' ? '/admin/commercial' : '/');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl px-4 py-8 lg:grid-cols-[1fr_420px] lg:items-center lg:gap-12">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex">
            <img src="/all-in-one-seo-audit-logo.jpeg" alt="All In One SEO Audit Tool" className="h-16 w-auto max-w-[300px] object-contain" />
          </Link>
          <h1 className="mt-12 max-w-xl text-5xl font-semibold tracking-tight">Welcome back to your SEO workspace.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
            Continue audits, manage blog content, review reports, and pick up right where you left off.
          </p>
        </section>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Link href="/" className="mb-8 inline-flex lg:hidden">
            <img src="/all-in-one-seo-audit-logo.jpeg" alt="All In One SEO Audit Tool" className="h-14 w-auto max-w-[240px] object-contain" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Sign in</p>
            <h2 className="mt-2 text-2xl font-semibold">Log in to your account</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use your email and password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 pl-9" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 pl-9" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Need an account? <Link href="/signup" className="font-medium text-orange-600 hover:underline">Create one</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
