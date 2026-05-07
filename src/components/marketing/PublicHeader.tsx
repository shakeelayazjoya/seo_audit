'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, LogOut, Menu, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
}

const loggedOutLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

const loggedInLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Audit History', href: '/history' },
  { label: 'Dashboard', href: '/' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

const auditModules = [
  { label: 'Technical SEO Audit', href: '/technical-seo-audit' },
  { label: 'SEO Audit Tool', href: '/seo-audit-tool' },
  { label: 'On-Page & Content', href: '/on-page-content' },
  { label: 'CRO Analysis', href: '/cro-audit' },
  { label: 'Local SEO Audit', href: '/local-seo-audit' },
  { label: 'Schema Markup', href: '/schema-markup' },
];

const bookingUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/dexora/30min';

export function PublicHeader() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({ user: null }));
        if (mounted) setUser(response.ok ? data.user ?? null : null);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setSessionChecked(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const links = user ? loggedInLinks : loggedOutLinks;
  const displayName = user?.name?.trim() || user?.email || 'Account';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center">
          <img
            src="/all-in-one-seo-audit-logo.png"
            alt="All In One SEO Audit Tool"
            className="h-16 w-auto max-w-[350px] object-contain sm:h-16 sm:max-w-[260px] md:h-16 md:max-w-[320px]"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:bg-white/10 hover:text-white">
                Audit Modules
                <ChevronDown className="ml-2 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuSeparator />
              {auditModules.map((module) => (
                <DropdownMenuItem key={module.href} onSelect={() => router.push(module.href)} className="cursor-pointer">
                  {module.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {!user && sessionChecked && (
            <>
              <div className="mx-2 h-5 w-px bg-white/10" />
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:bg-white/10 hover:text-white">
                Login
              </Link>
              <Link href="/signup" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:bg-white/10 hover:text-white">
                Sign Up
              </Link>
            </>
          )}
          <Button asChild size="sm" className="ml-2 gap-1.5 rounded-xl">
            <a href={bookingUrl} target="_blank" rel="noreferrer">
              <CalendarDays className="size-3.5" />
              Book Call
            </a>
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="ml-1 rounded-full" aria-label="Open profile menu">
                  <User className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <span className="block truncate text-sm font-semibold">{displayName}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleLogout()} disabled={loggingOut} className="cursor-pointer">
                  <LogOut className="size-4" />
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <div className="mx-auto max-w-6xl space-y-1">
            {user && (
              <div className="mb-3 rounded-xl border bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            )}
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/10 hover:text-white"
              >
                {link.label}
                <ChevronRight className="ml-auto size-3.5 text-slate-300" />
              </Link>
            ))}
            <div className="mt-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100">Audit Modules</div>
            {auditModules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/10 hover:text-white"
              >
                {module.label}
              </Link>
            ))}
            {!user && sessionChecked && (
              <>
                <div className="my-2 h-px bg-white/10" />
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/10 hover:text-white">
                  Login <ChevronRight className="ml-auto size-3.5 text-slate-300" />
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/10 hover:text-white">
                  Sign Up <ChevronRight className="ml-auto size-3.5 text-slate-300" />
                </Link>
              </>
            )}
            <Button asChild size="sm" className="mt-3 w-full rounded-xl">
              <a href={bookingUrl} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)}>
                <CalendarDays className="mr-1.5 size-3.5" />
                Book Call
              </a>
            </Button>
            {user && (
              <Button variant="outline" size="sm" className="mt-2 w-full rounded-xl" onClick={() => { setMobileOpen(false); void handleLogout(); }} disabled={loggingOut}>
                <LogOut className="mr-1.5 size-3.5" />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
