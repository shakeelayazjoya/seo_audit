'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { getSupportEmail, getSupportWhatsappUrl } from '@/lib/support';

export function PublicFooter() {
  const supportEmail = getSupportEmail();
  const whatsappUrl = getSupportWhatsappUrl('Hi, I need help with my SEO audit.');

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <img
                src="/all-in-one-seo-audit-logo.png"
                alt="All In One SEO Audit logo"
                className="h-12 w-auto max-w-[180px] sm:h-14 sm:max-w-[200px] object-contain"
              />
              <a href="https://dexoradigital.com">
              <img
                src="/dexora.png"
                alt="Dexora Digital logo"
                className="h-12 w-auto max-w-[180px] sm:h-14 sm:max-w-[200px] object-contain"
              />
              </a>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Professional SEO audit platform trusted by thousands of businesses worldwide. Get actionable insights to improve your search rankings.
            </p>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed">
              Powered by{' '}
              <a
                href="https://dexoradigital.com"
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-slate-100 transition-colors"
              >
                Dexora Digital
              </a>
              .
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
              Audit Modules
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/technical-seo-audit" className="hover:text-white transition-colors">
                  Technical SEO Audit
                </Link>
              </li>
              <li>
                <Link href="/seo-audit-tool" className="hover:text-white transition-colors">
                  SEO Audit Tool
                </Link>
              </li>
              <li>
                <Link href="/on-page-content" className="hover:text-white transition-colors">
                  On-Page & Content
                </Link>
              </li>
              <li>
                <Link href="/cro-audit" className="hover:text-white transition-colors">
                  CRO Analysis
                </Link>
              </li>
              
              <li>
                <Link href="/seo-local-audit" className="hover:text-white transition-colors">
                  Local SEO Audit
                </Link>
              </li>
              <li>
                <Link href="/schema-markup" className="hover:text-white transition-colors">
                  Schema Markup
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href={`mailto:${supportEmail}`} className="hover:text-white transition-colors">
                  {supportEmail}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6 bg-white/10" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 SEO Audit Platform. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
