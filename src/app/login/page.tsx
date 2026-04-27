'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Globe, Lock, ArrowRight } from 'lucide-react';

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

    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0A0F1C] relative overflow-hidden">
      {/* Background Glow Effects - Matching Hero Style */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293720_1px,transparent_1px),linear-gradient(to_bottom,#1E293720_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
            <Globe className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-white/60 mt-2">Sign in to access your SEO audits and tools</p>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-2xl text-white">Log in</CardTitle>
            <CardDescription className="text-white/60">
              Access your audit history and premium features
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    ✉️
                  </div>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 backdrop-blur"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Lock className="size-4" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 backdrop-blur"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all active:scale-[0.985]"
                disabled={loading}
              >
                {loading ? (
                  'Logging in...'
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-white/60">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                >
                  Create one free →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust footer */}
        <div className="text-center mt-8 text-xs text-white/50">
          Secure login • 256-bit encryption
        </div>
      </div>
    </div>
  );
}