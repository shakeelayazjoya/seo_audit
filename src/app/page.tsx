'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams, ReadonlyURLSearchParams } from 'next/navigation';
import {
  Search,
  BarChart3,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Star,
  Loader2,
  FileText,
  Phone,
  Users,
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
  TrendingUp,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AuditDashboard } from '@/components/seo/AuditDashboard';
import { AuditHistory } from '@/components/seo/AuditHistory';
import { LoginPromptModal } from '@/components/seo/LoginPromptModal';
import type { AppView, AuditData, ModuleKey } from '@/lib/types';
import { MODULE_CONFIG } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactSection } from '@/components/seo/ContactSection';

// ============================================================
// Global Styles (injected once)
// ============================================================
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

    :root {
      --font-display: 'Bricolage Grotesque', sans-serif;
      --font-body: 'DM Sans', sans-serif;
      --accent-emerald: #10b981;
      --accent-emerald-light: #d1fae5;
      --radius-card: 16px;
      --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
      --shadow-card-hover: 0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.1);
    }

    * { font-family: var(--font-body); }

    h1, h2, h3, .display { font-family: var(--font-display); }

    .hero-grid {
      background-image:
        linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
        linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .card-premium {
      border-radius: var(--radius-card) !important;
      box-shadow: var(--shadow-card);
      transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
    }
    .card-premium:hover {
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-2px);
    }

    .btn-primary-glow {
      position: relative;
      overflow: hidden;
    }
    .btn-primary-glow::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
      pointer-events: none;
    }

    .gradient-text {
      background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-card {
      border-radius: 12px;
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      padding: 20px;
      transition: all 0.2s ease;
    }
    .stat-card:hover {
      border-color: hsl(var(--primary) / 0.3);
      box-shadow: 0 0 0 3px hsl(var(--primary) / 0.06);
    }

    .pricing-popular {
      background: linear-gradient(180deg, hsl(var(--primary) / 0.04) 0%, transparent 100%);
    }

    .step-connector::after {
      content: '';
      position: absolute;
      top: 32px;
      left: calc(100% - 1px);
      width: calc(100% - 64px);
      height: 1px;
      background: linear-gradient(90deg, hsl(var(--border)) 0%, hsl(var(--border) / 0.2) 100%);
    }

    .badge-module {
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .faq-item {
      border-radius: 12px !important;
      margin-bottom: 8px;
      border: 1px solid hsl(var(--border)) !important;
      overflow: hidden;
      transition: border-color 0.2s ease;
    }
    .faq-item:hover {
      border-color: hsl(var(--primary) / 0.3) !important;
    }
    .faq-item[data-state="open"] {
      border-color: hsl(var(--primary) / 0.4) !important;
      background: hsl(var(--primary) / 0.02);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    .float { animation: float 4s ease-in-out infinite; }

    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.3); }
      70% { box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
      100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); }
    }
    .pulse-ring { animation: pulse-ring 2.5s ease-out infinite; }

    .nav-link {
      position: relative;
      font-size: 14px;
      font-weight: 500;
      color: hsl(var(--muted-foreground));
      transition: color 0.2s ease;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: hsl(var(--primary));
      transform: scaleX(0);
      transition: transform 0.2s ease;
      border-radius: 2px;
    }
    .nav-link:hover { color: hsl(var(--foreground)); }
    .nav-link:hover::after { transform: scaleX(1); }

    .testimonial-card {
      position: relative;
      overflow: hidden;
    }
    .testimonial-card::before {
      content: '"';
      font-family: var(--font-display);
      position: absolute;
      top: -12px;
      left: 16px;
      font-size: 80px;
      color: hsl(var(--primary) / 0.08);
      font-weight: 800;
      line-height: 1;
      pointer-events: none;
    }
  `}</style>
);

// ============================================================
// Header / Navigation
// ============================================================
interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
}

function Header({
  onScrollTo,
  user,
  onLogout,
  loggingOut,
}: {
  onScrollTo: (id: string) => void;
  user: SessionUser | null;
  onLogout: () => Promise<void>;
  loggingOut: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { label: 'Features', id: 'features' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];
  const displayName = user?.name?.trim() || user?.email || 'Account';
  const isAdmin = user?.role === 'admin';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-background/98 backdrop-blur-xl shadow-sm border-b'
          : 'bg-background/80 backdrop-blur-md border-b border-transparent'
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-sm pulse-ring">
            <BarChart3 className="size-4.5 text-primary-foreground" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', letterSpacing: '-0.01em' }}>
            SEO Audit
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {user ? (
            isAdmin ? (
              <Link href="/admin" className="nav-link px-3 py-1.5 rounded-lg hover:bg-muted/50">
                Admin
              </Link>
            ) : (
              <>
                <Link href="/history" className="nav-link px-3 py-1.5 rounded-lg hover:bg-muted/50">
                  My History
                </Link>
                <button onClick={() => onScrollTo('hero')} className="nav-link px-3 py-1.5 rounded-lg hover:bg-muted/50">
                  Dashboard
                </button>
              </>
            )
          ) : (
            <>
              <Link href="/login" className="nav-link px-3 py-1.5 rounded-lg hover:bg-muted/50">
                Login
              </Link>
              <Link href="/signup" className="nav-link px-3 py-1.5 rounded-lg hover:bg-muted/50">
                Sign Up
              </Link>
            </>
          )}

          {!isAdmin && (
            <>
              <div className="w-px h-5 bg-border mx-2" />
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onScrollTo(l.id)}
                  className="nav-link px-3 py-1.5 rounded-lg hover:bg-muted/50"
                >
                  {l.label}
                </button>
              ))}
            </>
          )}

          {user && (
            <>
              <div className="w-px h-5 bg-border mx-2" />
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
                <div className="size-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="size-3 text-primary" />
                </div>
                <span className="max-w-32 truncate font-medium">{displayName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void onLogout()}
                disabled={loggingOut}
                className="text-muted-foreground hover:text-foreground gap-1.5 h-8 px-3 rounded-lg"
              >
                <LogOut className="size-3.5" />
                {loggingOut ? 'Signing out…' : 'Logout'}
              </Button>
            </>
          )}

          {!isAdmin && !user && (
            <Button size="sm" onClick={() => onScrollTo('hero')} className="ml-2 btn-primary-glow rounded-xl h-9 px-4 gap-1.5 shadow-sm">
              <Search className="size-3.5" />
              Free Audit
            </Button>
          )}
          {!isAdmin && user && (
            <Button size="sm" onClick={() => onScrollTo('hero')} className="ml-2 btn-primary-glow rounded-xl h-9 px-4 gap-1.5 shadow-sm">
              <Search className="size-3.5" />
              Free Audit
            </Button>
          )}
        </nav>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t bg-background/98"
          >
            <div className="px-4 py-5 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3 mb-3">
                    <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <User className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{isAdmin ? 'Administrator' : 'Member'}</p>
                    </div>
                  </div>
                  {isAdmin ? (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 w-full text-sm py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      Admin Dashboard <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
                    </Link>
                  ) : (
                    <>
                      <Link href="/history" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 w-full text-sm py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                        My History <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
                      </Link>
                      <button onClick={() => { onScrollTo('hero'); setMobileOpen(false); }} className="flex items-center gap-2 w-full text-sm py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                        Dashboard <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
                      </button>
                    </>
                  )}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => { setMobileOpen(false); void onLogout(); }} disabled={loggingOut}>
                      <LogOut className="size-3.5 mr-1.5" />
                      {loggingOut ? 'Signing out…' : 'Logout'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 w-full text-sm py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    Login <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 w-full text-sm py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    Sign Up <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
                  </Link>
                </>
              )}
              {!isAdmin && (
                <>
                  <div className="h-px bg-border my-2" />
                  {links.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => { onScrollTo(l.id); setMobileOpen(false); }}
                      className="flex items-center gap-2 w-full text-sm py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
                    >
                      {l.label}
                    </button>
                  ))}
                  <div className="pt-2">
                    <Button size="sm" className="w-full rounded-xl btn-primary-glow" onClick={() => { onScrollTo('hero'); setMobileOpen(false); }}>
                      <Search className="size-3.5 mr-1.5" />
                      Free Audit
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ============================================================
// Landing Page
// ============================================================
function LandingPage({ onAnalyze }: { onAnalyze: (domain: string, email?: string) => void }) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [pastAudits, setPastAudits] = useState<AuditData[]>([]);
  const [commerceLoading, setCommerceLoading] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({ user: null }));
        if (response.ok) {
          setSessionUser(data.user ?? null);
          setEmail((currentEmail) => currentEmail || data.user?.email || '');
        }
        else setSessionUser(null);
      })
      .catch(() => setSessionUser(null));
  }, []);

  useEffect(() => {
    if (!sessionUser) return;
    fetch('/api/audits', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const audits = Array.isArray(data) ? data : Array.isArray(data?.audits) ? data.audits : [];
        if (audits.length > 0) {
          const mapped = audits.map((a: Record<string, unknown>) => ({
            id: a.id as string,
            domain: a.domain as string,
            status: a.status as string,
            overallScore: (a.overallScore as number) ?? 0,
            technical: a.technical ? JSON.parse(a.technical as string) : null,
            onPage: a.onPage ? JSON.parse(a.onPage as string) : null,
            performance: a.performance ? JSON.parse(a.performance as string) : null,
            cro: a.cro ? JSON.parse(a.cro as string) : null,
            localSeo: a.localSeo ? JSON.parse(a.localSeo as string) : null,
            aiSeo: a.aiSeo ? JSON.parse(a.aiSeo as string) : null,
            schema: a.schema ? JSON.parse(a.schema as string) : null,
            createdAt: a.createdAt as string,
            errorMessage: (a.errorMessage as string | null | undefined) ?? null,
            isPartial: Boolean(a.isPartial),
            partialReason: (a.partialReason as string | null | undefined) ?? null,
          }));
          setPastAudits(mapped);
        }
      })
      .catch(() => { });
  }, [sessionUser]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSessionUser(null);
      setPastAudits([]);
      window.location.href = '/';
    } finally {
      setLoggingOut(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !email.trim()) return;
    onAnalyze(url.trim(), email.trim());
  };

  const startCommercialFlow = async (flow: 'diy' | 'strategy' | 'implementation') => {
    setCommerceLoading(flow);
    try {
      if (flow === 'strategy') {
        const response = await fetch('/api/commercial/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: url || null }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Booking failed');
        if (typeof window !== 'undefined' && (window as any).Calendly) {
          (window as any).Calendly.initPopupWidget({ url: data.bookingUrl });
          return;
        }
        window.location.href = data.url;
        return;
      }
      const response = await fetch('/api/commercial/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: flow === 'implementation' ? 'implementation' : 'diy' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error('Commercial flow error:', error);
    } finally {
      setCommerceLoading(null);
    }
  };

  const features = [
    { icon: <Shield className="size-5" />, title: 'Technical SEO Audit', desc: 'SSL, sitemaps, crawlability, structured data & 40+ technical checks', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: <Zap className="size-5" />, title: 'Core Web Vitals', desc: 'LCP, INP, CLS metrics with Google PageSpeed Insights integration', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: <FileText className="size-5" />, title: 'On-Page & Content', desc: 'Title tags, meta descriptions, headings, keyword analysis & more', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: <Users className="size-5" />, title: 'CRO Analysis', desc: 'CTA detection, form friction, trust signals & conversion optimization', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { icon: <Globe className="size-5" />, title: 'Local SEO', desc: 'Google Business Profile, NAP consistency & local search signals', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: <Sparkles className="size-5" />, title: 'AI SEO / E-E-A-T', desc: 'Author bios, topical clusters, content freshness & AI readiness', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  ];

  const pricingPlans = [
    {
      name: 'DIY Plan', price: '$99', period: 'one-time',
      description: 'Perfect for developers and in-house teams',
      features: ['Full PDF with all fix guides', '30-day audit history', 'Email support', 'Quick Wins prioritization', 'Module-by-module scoring', 'Impact vs Effort matrix'],
      cta: 'Get Started', popular: false,
    },
    {
      name: 'Strategy Plan', price: '$299', period: 'one-time',
      description: 'For businesses ready to take action',
      features: ['Everything in DIY Plan', '1-hour strategy call', 'Competitor comparison report', 'Priority email support', 'Monthly re-audit reminder', 'Custom action roadmap'],
      cta: 'Get Strategy', popular: true,
    },
    {
      name: 'Full Implementation', price: '$999', period: 'one-time',
      description: 'Done-for-you SEO overhaul',
      features: ['Everything in Strategy Plan', 'Done-for-you fixes', 'Monthly re-audit included', 'Dedicated account manager', 'Slack support channel', 'White-label PDF reports'],
      cta: 'Contact Sales', popular: false,
    },
  ];

  const faqs = [
    { q: 'How long does an SEO audit take?', a: 'Our audit typically completes in 60 seconds. We analyze up to 300 pages across 7 SEO modules including technical, on-page, performance, CRO, local SEO, AI/E-E-A-T, and schema markup.' },
    { q: 'What does the free audit include?', a: "The free audit provides a comprehensive overview of your site's SEO health with an overall score (0-100), individual module grades (A-F), and a list of detected issues with severity levels. Fix guides are available with the paid report." },
    { q: 'How accurate are the audit results?', a: "Our audit engine uses the same methodology as Google's PageSpeed Insights and Lighthouse for performance metrics. Technical and on-page checks follow industry best practices aligned with Google's Search Quality Evaluator Guidelines." },
    { q: 'What happens after I get my audit results?', a: "You'll see a prioritized list of issues sorted by impact and effort. Focus on \"Quick Wins\" first — high-impact, low-effort fixes that deliver immediate improvements. The paid report includes detailed step-by-step fix guides for every issue." },
    { q: 'Can I audit multiple websites?', a: "Yes! There's no limit to the number of websites you can audit. Create an account to keep track of all your audit history in one dashboard and monitor improvements over time." },
    { q: 'How often should I run an audit?', a: 'We recommend running audits at least monthly, or after any significant website changes. The Strategy and Full Implementation plans include automated monthly re-audits so you can track your progress continuously.' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Marketing Director, SaaS Company', text: 'Increased our organic traffic by 143% in 3 months by following the prioritized action plan.', stars: 5 },
    { name: 'Marcus Rivera', role: 'E-commerce Owner', text: 'The Quick Wins feature alone helped us fix 12 critical issues in a single afternoon.', stars: 5 },
    { name: 'Emma Larsson', role: 'SEO Consultant', text: 'I run audits for every client through this platform. The reports save me hours of work every week.', stars: 5 },
  ];

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const auditCount = pastAudits.length;
  const averageScore = auditCount > 0 ? Math.round(pastAudits.reduce((sum, a) => sum + a.overallScore, 0) / auditCount) : 0;
  const trackedDomains = new Set(pastAudits.map((a) => a.domain.toLowerCase())).size;
  const issueCount = pastAudits.reduce((sum, audit) => {
    const modules = [audit.technical, audit.onPage, audit.performance, audit.cro, audit.localSeo, audit.aiSeo, audit.schema];
    return sum + modules.reduce((ms, m) => ms + (m?.issues.length ?? 0), 0);
  }, 0);

  const checkoutStatus = searchParams.get('checkout');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalStyles />
      <Header onScrollTo={scrollTo} user={sessionUser} onLogout={handleLogout} loggingOut={loggingOut} />

      {/* Checkout banner */}
      {checkoutStatus && (
        <motion.section initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="border-b bg-muted/40">
          <div className="mx-auto max-w-4xl px-4 py-3 text-sm sm:px-6">
            {checkoutStatus === 'success' ? (
              <p className="text-emerald-700 flex items-center gap-2"><CheckCircle2 className="size-4" /> Payment completed successfully. Your team can continue from your dashboard and inbox.</p>
            ) : (
              <p className="text-amber-700">Checkout was cancelled. Your saved checkout link can still be reopened from the email flow.</p>
            )}
          </div>
        </motion.section>
      )}

      {/* ── HERO ── */}
      <section id="hero" className="relative overflow-hidden border-b">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid opacity-60" />
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        {/* Accent blobs */}
        <div className="absolute top-20 left-1/4 size-64 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 size-48 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Badge
                variant="secondary"
                className="mb-2 px-4 py-1.5 rounded-full text-xs font-semibold gap-2 border border-primary/20 bg-primary/5 text-primary shadow-sm"
              >
                <Sparkles className="size-3" />
                AI-Powered SEO Analysis
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}
              className="text-4xl sm:text-6xl mb-4"
            >
              Analyze Your SEO in{' '}
              <span className="relative inline-block">
                <span className="gradient-text">60 Seconds</span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 to-primary/10 rounded-full" />
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get a comprehensive SEO audit across 7 dimensions with prioritized action items,
              quick wins, and a step-by-step fix guide — completely free.
            </motion.p>

            {/* Search form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 max-w-2xl mx-auto"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_auto]">
                <div className="relative flex-1 group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    type="url"
                    placeholder="Enter your domain (e.g., example.com)"
                    className="pl-11 h-13 text-base rounded-2xl border-border/60 bg-background/80 focus:bg-background shadow-sm transition-all focus:shadow-md focus:border-primary/50"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ height: '52px' }}
                    required
                  />
                </div>
                <div className="relative flex-1 group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-11 h-13 text-base rounded-2xl border-border/60 bg-background/80 focus:bg-background shadow-sm transition-all focus:shadow-md focus:border-primary/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ height: '52px' }}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-13 px-7 rounded-2xl btn-primary-glow shadow-md hover:shadow-lg transition-all font-semibold gap-2"
                  style={{ height: '52px' }}
                >
                  <Search className="size-4" />
                  Free Audit
                </Button>
              </div>
            </motion.form>

            {/* Trust badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {['URL + email required', 'Preview PDF emailed automatically', '7 SEO modules', 'Full report after login'].map((text) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1.5 border border-border/50">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  {text}
                </span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { value: auditCount > 0 ? auditCount.toLocaleString() : '0', label: 'Audits Stored', icon: <BarChart3 className="size-4" /> },
                { value: '7', label: 'SEO Modules', icon: <Shield className="size-4" /> },
                { value: issueCount > 0 ? issueCount.toLocaleString() : '0', label: 'Issues Logged', icon: <TrendingUp className="size-4" /> },
                { value: trackedDomains > 0 ? `${averageScore}/100` : 'N/A', label: trackedDomains > 0 ? 'Avg Score' : 'Score Pending', icon: <Award className="size-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="stat-card text-center group cursor-default">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground group-hover:text-primary transition-colors">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-3 px-4 py-1.5 rounded-full text-xs font-medium">Comprehensive Analysis</Badge>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-3xl sm:text-4xl mb-3">
            Everything You Need to Rank Higher
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Our audit covers 7 critical SEO dimensions with actionable insights and prioritized recommendations
          </p>
        </motion.div>

        {/* Module weight pills */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {(Object.keys(MODULE_CONFIG) as ModuleKey[]).map((key) => (
            <div key={key} className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3.5 py-2 text-xs shadow-sm hover:border-border hover:shadow transition-all badge-module">
              <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: MODULE_CONFIG[key].color }} />
              <span className="font-medium">{MODULE_CONFIG[key].label}</span>
              <span className="text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                {MODULE_CONFIG[key].weight}%
              </span>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.45 }}
            >
              <Card className="card-premium h-full border border-border/60 bg-background/60 backdrop-blur-sm py-0 gap-0">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className={`p-3 rounded-2xl ${feature.bg} ${feature.color} shrink-0`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1.5" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative overflow-hidden bg-muted/30 border-y">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/60" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-3xl sm:text-4xl mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">Three simple steps to improve your SEO</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '01', title: 'Enter Your Domain', desc: 'Type in any website URL. No signup, no credit card, no commitment required.', icon: <Globe className="size-6" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { step: '02', title: 'Get Your Audit', desc: 'Our engine analyzes up to 300 pages across 7 SEO modules in under 60 seconds.', icon: <BarChart3 className="size-6" />, color: 'text-violet-500', bg: 'bg-violet-500/10' },
              { step: '03', title: 'Fix & Improve', desc: 'Follow prioritized recommendations. Start with Quick Wins for immediate results.', icon: <Zap className="size-6" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                className="relative text-center group"
              >
                {/* Connector line (desktop) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-9 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px bg-gradient-to-r from-border to-border/20 z-10" />
                )}
                <div className="relative inline-flex">
                  <div className={`size-18 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-5 mx-auto transition-transform group-hover:scale-110 duration-300`} style={{ width: '72px', height: '72px' }}>
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 size-7 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shadow-sm" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-3 px-4 py-1.5 rounded-full text-xs font-medium">Simple Pricing</Badge>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-3xl sm:text-4xl mb-3">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need detailed fix guides and expert guidance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.45 }}
              className={plan.popular ? 'md:-mt-3 md:mb-3' : ''}
            >
              <Card className={`relative h-full flex flex-col py-0 gap-0 card-premium overflow-hidden ${plan.popular
                  ? 'border-primary/40 shadow-lg shadow-primary/10 pricing-popular'
                  : 'border-border/60'
                }`}>
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-full">
                      <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-t-lg shadow-sm">
                        Most Popular
                      </div>
                    </div>
                  </>
                )}
                <CardHeader className="pb-0 pt-6 px-6">
                  <CardTitle style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }} className="text-lg">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 px-6 flex-1">
                  <div className="mb-5 flex items-end gap-1.5">
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em' }} className="text-4xl">{plan.price}</span>
                    <span className="text-sm text-muted-foreground mb-1">{plan.period}</span>
                  </div>
                  <Separator className="mb-5" />
                  <ul className="space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-4">
                  <Button
                    className={`w-full rounded-xl font-semibold gap-2 transition-all ${plan.popular ? 'btn-primary-glow shadow-md hover:shadow-lg' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => startCommercialFlow(plan.name === 'Strategy Plan' ? 'strategy' : plan.name === 'Full Implementation' ? 'implementation' : 'diy')}
                    disabled={!!commerceLoading}
                  >
                    {commerceLoading && ((commerceLoading === 'diy' && plan.name === 'DIY Plan') || (commerceLoading === 'strategy' && plan.name === 'Strategy Plan') || (commerceLoading === 'implementation' && plan.name === 'Full Implementation'))
                      ? <><Loader2 className="size-4 animate-spin" /> Opening…</>
                      : <>{plan.cta} <ArrowRight className="size-3.5" /></>
                    }
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative bg-muted/30 border-y overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-3xl sm:text-4xl mb-3">
              Trusted by Thousands of Teams
            </h2>
            <p className="text-muted-foreground">See how others have improved their search rankings</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.45 }}
              >
                <Card className="card-premium h-full py-0 gap-0 border-border/60 testimonial-card">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80 mb-5 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0" style={{ fontFamily: 'var(--font-display)' }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-3xl sm:text-4xl mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">Everything you need to know about our SEO audit tool</p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-0">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="faq-item border px-5">
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-5" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-muted/30 border-y">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-64 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="float mx-auto mb-6 size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="size-8" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-3xl sm:text-4xl mb-4">
              Ready to Improve Your Rankings?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Run your free audit now and get instant, actionable recommendations to boost your organic traffic.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => scrollTo('hero')} className="rounded-2xl btn-primary-glow shadow-md hover:shadow-lg h-12 px-7 gap-2 font-semibold">
                <Search className="size-4" />
                Start Free Audit
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo('pricing')} className="rounded-2xl h-12 px-7 gap-2 font-semibold border-border/60 hover:border-border">
                <Phone className="size-4" />
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RECENT AUDITS ── */}
      {sessionUser && pastAudits.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <AuditHistory audits={pastAudits} onSelectAudit={(a) => onAnalyze(a.id)} />
        </section>
      )}

      {/* ── SPECIALIZED ROUTES ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/60 bg-muted/20 p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Explore specialized audit routes</h3>
              <p className="text-sm text-muted-foreground">
                These landing pages connect into the same live crawl, scoring, history, and PDF export pipeline.
              </p>
            </div>
            {sessionUser && (
              <Button asChild variant="outline" className="rounded-xl shrink-0">
                <Link href="/history">Open Audit History</Link>
              </Button>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ['/seo-audit-tool', 'SEO Audit Tool'],
              ['/technical-seo-audit', 'Technical SEO Audit'],
              ['/ai-seo-audit', 'AI SEO Audit'],
              ['/local-seo-audit', 'Local SEO Audit'],
              ['/cro-audit', 'CRO Audit'],
            ].map(([href, label]) => (
              <Button key={href} asChild variant="secondary" size="sm" className="rounded-xl font-medium">
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </div>
        </motion.div>
      </section>
      <ContactSection />
      {/* ── FOOTER ── */}
      <footer className="border-t bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-xl bg-primary flex items-center justify-center">
                  <BarChart3 className="size-3.5 text-primary-foreground" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.01em' }}>SEO Audit</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Professional SEO audit platform trusted by thousands of businesses worldwide. Get actionable insights to improve your search rankings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Product</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><button onClick={() => scrollTo('features')} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollTo('faq')} className="hover:text-foreground transition-colors">FAQ</button></li>
                {sessionUser && <li><Link href="/history" className="hover:text-foreground transition-colors">Audit History</Link></li>}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Audit Modules</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><Link href="/technical-seo-audit" className="hover:text-foreground transition-colors">Technical SEO</Link></li>
                <li><Link href="/seo-audit-tool" className="hover:text-foreground transition-colors">Core Web Vitals</Link></li>
                <li><Link href="/seo-audit-tool" className="hover:text-foreground transition-colors">On-Page & Content</Link></li>
                <li><Link href="/cro-audit" className="hover:text-foreground transition-colors">CRO Analysis</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Growth Pages</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><Link href="/ai-seo-audit" className="hover:text-foreground transition-colors">AI SEO Audit</Link></li>
                <li><Link href="/local-seo-audit" className="hover:text-foreground transition-colors">Local SEO Audit</Link></li>
                <li><Link href="/seo-audit-tool" className="hover:text-foreground transition-colors">SEO Audit Tool</Link></li>
                {sessionUser && <li><Link href="/history" className="hover:text-foreground transition-colors">Domain Trends</Link></li>}
              </ul>
            </div>
          </div>
          <Separator className="mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2025 SEO Audit Platform. All rights reserved.</p>
            <div className="flex gap-5">
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Loading State
// ============================================================
function LoadingState({ domain }: { domain: string }) {
  const steps = [
    'Connecting to server…',
    'Crawling website pages…',
    'Analyzing technical SEO…',
    'Checking Core Web Vitals…',
    'Evaluating on-page factors…',
    'Scanning CRO signals…',
    'Analyzing local SEO…',
    'Checking AI/E-E-A-T signals…',
    'Validating schema markup…',
    'Calculating scores…',
  ];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(interval);
  }, [steps.length]);

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <GlobalStyles />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md w-full"
      >
        {/* Animated logo */}
        <div className="mx-auto mb-8 relative size-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping opacity-30" />
          <div className="relative size-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <BarChart3 className="size-9 text-primary" />
            </motion.div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }} className="text-xl mb-1">
          Auditing {domain}
        </h2>
        <p className="text-sm text-muted-foreground mb-8">Running comprehensive SEO analysis across 7 modules</p>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-7">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2.5 text-left bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
          {steps.map((step, idx) => (
            <motion.div
              key={step}
              initial={{ opacity: 0.25 }}
              animate={{ opacity: idx <= activeStep ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              {idx < activeStep ? (
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              ) : idx === activeStep ? (
                <Loader2 className="size-4 text-primary animate-spin shrink-0" />
              ) : (
                <div className="size-4 rounded-full border-2 border-muted-foreground/25 shrink-0" />
              )}
              <span className={`text-sm ${idx <= activeStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-5">
          This usually takes under 60 seconds…
        </p>
      </motion.div>
    </div>
  );
}

// ============================================================
// App Root
// ============================================================
function HomeContent({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  const [view, setView] = useState<AppView>('landing');
  const [currentAudit, setCurrentAudit] = useState<AuditData | null>(null);
  const [pendingAuditId, setPendingAuditId] = useState<string | null>(null);
  const [inputDomain, setInputDomain] = useState('');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isDevPaidPreview =
    process.env.NODE_ENV !== 'production' &&
    (searchParams.get('preview') === 'paid' || searchParams.get('fullFixes') === '1');
  const isPaid = Boolean(sessionUser) || isDevPaidPreview;

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({ user: null }));
        setSessionUser(response.ok ? (data.user ?? null) : null);
      })
      .catch(() => setSessionUser(null));
  }, []);

  const handleAnalyze = useCallback(async (domainOrId: string, email?: string) => {
    setInputDomain(domainOrId);
    setView('loading');
    try {
      if (domainOrId.length > 20 && !domainOrId.includes('.')) {
        const res = await fetch(`/api/audit/${domainOrId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'queued' || data.status === 'running') {
            setPendingAuditId(data.id);
            setInputDomain(data.domain);
            setView('loading');
            return;
          }
          const modules = data.modules ?? {};
          setCurrentAudit({
            id: data.id, domain: data.domain, status: data.status, overallScore: data.overallScore,
            technical: data.technical ?? modules.technical ?? null,
            onPage: data.onPage ?? modules.onPage ?? null,
            performance: data.performance ?? modules.performance ?? null,
            cro: data.cro ?? modules.cro ?? null,
            localSeo: data.localSeo ?? modules.localSeo ?? null,
            aiSeo: data.aiSeo ?? modules.aiSeo ?? null,
            schema: data.schema ?? modules.schema ?? null,
            createdAt: data.createdAt, errorMessage: data.errorMessage ?? null,
            isPartial: data.isPartial ?? false, partialReason: data.partialReason ?? null,
            history: Array.isArray(data.history) ? data.history : [],
          });
          setPendingAuditId(null);
          setView('dashboard');
          return;
        }
      }
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainOrId, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Audit failed');
      }
      const data = await res.json();
      if (data.status === 'queued' || data.status === 'running') {
        setPendingAuditId(data.id);
        setInputDomain(data.domain);
        setView('loading');
        return;
      }
      const modules = data.modules;
      setCurrentAudit({
        id: data.id, domain: data.domain, status: data.status, overallScore: data.overallScore,
        technical: modules?.technical ?? null, onPage: modules?.onPage ?? null,
        performance: modules?.performance ?? null, cro: modules?.cro ?? null,
        localSeo: modules?.localSeo ?? null, aiSeo: modules?.aiSeo ?? null,
        schema: modules?.schema ?? null, createdAt: data.createdAt,
        errorMessage: data.errorMessage ?? null, isPartial: data.isPartial ?? false,
        partialReason: data.partialReason ?? null,
        history: Array.isArray(data.history) ? data.history : [],
      });
      setPendingAuditId(null);
      setView('dashboard');
    } catch (err) {
      console.error('Audit error:', err);
      setPendingAuditId(null);
      setView('landing');
    }
  }, []);

  const handleBack = useCallback(() => {
    setView('landing');
    setCurrentAudit(null);
    setPendingAuditId(null);
  }, []);

  useEffect(() => {
    const auditId = searchParams.get('audit');
    if (auditId && view === 'landing' && !currentAudit) {
      const timeoutId = window.setTimeout(() => { void handleAnalyze(auditId); }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [searchParams, view, currentAudit, handleAnalyze]);

  useEffect(() => {
    if (view !== 'loading' || !pendingAuditId) return;
    let cancelled = false;
    let pollDelayMs = 5000;
    const startedAt = Date.now();
    let timeoutId: number | null = null;
    const MAX_POLL_DURATION_MS = 190000;

    const pollAudit = async () => {
      let shouldContinue = true;
      try {
        if (Date.now() - startedAt > MAX_POLL_DURATION_MS) {
          console.error('Audit polling timed out');
          setPendingAuditId(null);
          setView('landing');
          shouldContinue = false;
          return;
        }
        const res = await fetch(`/api/audit/${pendingAuditId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.status === 'complete') {
          const modules = data.modules ?? {};
          setCurrentAudit({
            id: data.id, domain: data.domain, status: data.status, overallScore: data.overallScore,
            technical: data.technical ?? modules.technical ?? null,
            onPage: data.onPage ?? modules.onPage ?? null,
            performance: data.performance ?? modules.performance ?? null,
            cro: data.cro ?? modules.cro ?? null,
            localSeo: data.localSeo ?? modules.localSeo ?? null,
            aiSeo: data.aiSeo ?? modules.aiSeo ?? null,
            schema: data.schema ?? modules.schema ?? null,
            createdAt: data.createdAt, errorMessage: data.errorMessage ?? null,
            isPartial: data.isPartial ?? false, partialReason: data.partialReason ?? null,
            history: Array.isArray(data.history) ? data.history : [],
          });
          setPendingAuditId(null);
          setView('dashboard');
          shouldContinue = false;
          return;
        }
        if (data.status === 'failed') {
          console.error('Audit worker failed:', data.errorMessage);
          setPendingAuditId(null);
          setView('landing');
          shouldContinue = false;
          return;
        }
      } catch (error) {
        console.error('Audit polling error:', error);
      } finally {
        if (!cancelled && shouldContinue && pendingAuditId) {
          pollDelayMs = Math.min(15000, Math.round(pollDelayMs * 1.35));
          timeoutId = window.setTimeout(() => { void pollAudit(); }, pollDelayMs);
        }
      }
    };

    void pollAudit();
    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [view, pendingAuditId]);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LandingPage onAnalyze={handleAnalyze} />
          </motion.div>
        )}
        {view === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LoadingState domain={inputDomain} />
          </motion.div>
        )}
        {view === 'dashboard' && currentAudit && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AuditDashboard
              audit={currentAudit}
              onBack={handleBack}
              isPaid={isPaid}
              onUpgradeClick={() => setShowLoginModal(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <LoginPromptModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}

function HomeClient() {
  const searchParams = useSearchParams();
  return <HomeContent searchParams={searchParams} />;
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
