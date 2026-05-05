'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const publicLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center">
          <img
            src="/all-in-one-seo-audit-logo.jpeg"
            alt="All In One SEO Audit Tool"
            className="h-12 w-auto max-w-[220px] object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white">
            Login
          </Link>
          <Link href="/signup" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white">
            Sign Up
          </Link>
          <div className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-800" />
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2 gap-1.5 rounded-xl">
            <Link href="/">
              <Search className="size-3.5" />
              Free Audit
            </Link>
          </Button>
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
        <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <div className="mx-auto max-w-6xl space-y-1">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900">
              Login <ChevronRight className="ml-auto size-3.5 text-slate-400" />
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900">
              Sign Up <ChevronRight className="ml-auto size-3.5 text-slate-400" />
            </Link>
            <div className="my-2 h-px bg-slate-200 dark:bg-slate-800" />
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                {link.label}
                <ChevronRight className="ml-auto size-3.5 text-slate-400" />
              </Link>
            ))}
            <Button asChild size="sm" className="mt-3 w-full rounded-xl">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Search className="mr-1.5 size-3.5" />
                Free Audit
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
