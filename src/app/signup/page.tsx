'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? 'Signup failed');
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex" style={{ minHeight: '520px' }}>

        {/* ── LEFT PANEL ── */}
        <section
          className="relative hidden lg:flex flex-col w-[42%] p-10 overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #ea580c 0%, #c2410c 55%, #9a3412 100%)',
          }}
        >
          {/* Blobs */}
          <div className="absolute rounded-full" style={{ width: '260px', height: '260px', top: '-60px', right: '-80px', background: 'rgba(255,255,255,0.13)' }} />
          <div className="absolute rounded-full" style={{ width: '180px', height: '180px', top: '140px', right: '-60px', background: 'rgba(255,255,255,0.10)' }} />
          <div className="absolute rounded-full" style={{ width: '220px', height: '220px', bottom: '-80px', left: '-60px', background: 'rgba(255,255,255,0.10)' }} />

          <div className="relative z-10 flex flex-col">
            {/* Logo */}
            <Link href="/" className="inline-flex shrink-0">
              <img
                src="/all-in-one-seo-audit-logo.png"
                alt="All In One SEO Audit Tool"
                className="h-16 w-auto max-w-[200px] object-contain brightness-0 invert"
              />
            </Link>

            {/* Bottom content */}
            <div className="mt-auto">
              <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                Join Us Today!
              </h1>
              <p className="mt-3 text-sm text-orange-100 leading-relaxed">
                Save reports, unlock full fix plans,<br />and build a history of every audit.
              </p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-white/80 px-8 py-2.5 text-sm font-bold text-white tracking-wider transition-all hover:bg-white hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                SIGN IN
              </button>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL ── */}
        <section className="flex-1 bg-white dark:bg-slate-900 flex flex-col justify-center px-12 py-10">

          {/* Mobile logo */}
          <Link href="/" className="mb-6 inline-flex lg:hidden">
            <img
              src="/all-in-one-seo-audit-logo.png"
              alt="All In One SEO Audit Tool"
              className="h-12 w-auto max-w-[200px] object-contain"
            />
          </Link>

          <div className="text-center mb-7">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              create account
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              Sign up to get started for free
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 pl-11 rounded-full border border-slate-200 dark:border-slate-700 bg-orange-50/70 dark:bg-slate-800 focus-visible:ring-orange-500 placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-11 rounded-full border border-slate-200 dark:border-slate-700 bg-orange-50/70 dark:bg-slate-800 focus-visible:ring-orange-500 placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-11 rounded-full border border-slate-200 dark:border-slate-700 bg-orange-50/70 dark:bg-slate-800 focus-visible:ring-orange-500 placeholder:text-slate-400 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full gap-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm tracking-wider shadow-lg shadow-orange-200 dark:shadow-none transition-all"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-orange-600 hover:underline dark:text-orange-400"
            >
              log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}