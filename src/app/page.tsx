'use client';

import Link from 'next/link';
import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { LeadCaptureDialog } from '@/components/seo/LeadCaptureDialog';
import { AuditHistory } from '@/components/seo/AuditHistory';
import { LoginPromptModal } from '@/components/seo/LoginPromptModal';
import { ContactSection } from '@/components/seo/ContactSection';
import type { AppView, AuditData, ModuleKey } from '@/lib/types';
import { MODULE_CONFIG } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ============================================================
// Header / Navigation  (UNCHANGED)
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

  const links = [
    { label: 'Features', id: 'features' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  const displayName = user?.name?.trim() || user?.email || 'Account';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = user?.role === 'admin';

  const handleMobileNavClick = (id: string) => {
    setMobileOpen(false);
    onScrollTo(id);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-gradient-to-br from-[#0B1220]/95 via-[#0F172A]/95 to-[#0B1220]/95 backdrop-blur-xl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/20 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg text-white">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <BarChart3 className="size-4 text-primary-foreground" />
          </div>
          SEO Audit
        </div>

        <nav className="hidden md:flex items-center gap-6 text-white/80">
          {!isAdmin &&
            links.map((l) => (
              <button
                key={l.id}
                onClick={() => onScrollTo(l.id)}
                className="text-sm hover:text-white transition"
              >
                {l.label}
              </button>
            ))}

          {!user && (
            <>
              <Link href="/login" className="text-sm hover:text-white">
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {user && !isAdmin && (
            <>
              <button
                onClick={() => onScrollTo('hero')}
                className="text-sm font-medium hover:text-primary transition"
              >
                Dashboard
              </button>
              <Link href="/history" className="text-sm font-medium hover:text-primary transition">
                My History
              </Link>
            </>
          )}

          {user && isAdmin && (
            <Link href="/admin/commercial" className="text-sm font-medium hover:text-white">
              Admin
            </Link>
          )}

          {!isAdmin && (
            <Button
              size="sm"
              onClick={() => onScrollTo('hero')}
              className="bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/30"
            >
              <Search className="size-4 mr-1" />
              Free Audit
            </Button>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 hover:bg-white/10 transition backdrop-blur">
                  <Avatar className="size-7">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[#0F172A] text-white border-white/10">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-white/60 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="size-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void onLogout()}
                  disabled={loggingOut}
                  className="text-red-400"
                >
                  <LogOut className="size-4 mr-2" />
                  {loggingOut ? 'Signing out...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="md:hidden border-t border-white/10 overflow-hidden bg-[#0B1220]"
          >
            <div className="p-4 space-y-3 text-white">
              {user && (
                <div className="flex items-center gap-2 border border-white/10 rounded-lg p-2 bg-white/5">
                  <Avatar className="size-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-white/60">{user.email}</p>
                  </div>
                </div>
              )}

              {!isAdmin && (
                <div className="flex flex-col gap-2">
                  {links.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleMobileNavClick(link.id)}
                      className="text-left text-sm font-medium hover:text-primary transition"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}

              {!user && (
                <>
                  <Link href="/login" className="block text-sm font-medium hover:text-primary transition">
                    Login
                  </Link>
                  <Link href="/signup" className="block">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}

              {user && !isAdmin && (
                <>
                  <button
                    onClick={() => handleMobileNavClick('hero')}
                    className="text-left text-sm font-medium hover:text-primary transition"
                  >
                    Dashboard
                  </button>
                  <Link href="/history" className="block text-sm font-medium hover:text-primary transition">
                    My History
                  </Link>
                </>
              )}

              {user && isAdmin && (
                <Link href="/admin/commercial" className="block text-sm font-medium hover:text-primary transition">
                  Admin
                </Link>
              )}

              {!isAdmin && (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => {
                    setMobileOpen(false);
                    onScrollTo('hero');
                  }}
                >
                  <Search className="size-4 mr-2" />
                  Free Audit
                </Button>
              )}

              {user && (
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    setMobileOpen(false);
                    void onLogout();
                  }}
                >
                  Logout
                </Button>
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

function LandingPage({ onAnalyze }: { onAnalyze: (domain: string) => void }) {
  const [url, setUrl] = useState('');
  const [pastAudits, setPastAudits] = useState<AuditData[]>([]);
  const [commerceLoading, setCommerceLoading] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({ user: null }));
        if (response.ok) {
          setSessionUser(data.user ?? null);
        } else {
          setSessionUser(null);
        }
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
    if (!url.trim()) return;
    if (!sessionUser) {
      setShowLoginModal(true);
      return;
    }
    onAnalyze(url.trim());
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
    {
      icon: <Shield className="size-5" />,
      title: 'Technical SEO Audit',
      desc: 'SSL, sitemaps, crawlability, structured data & 40+ technical checks',
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15',
    },
    {
      icon: <Zap className="size-5" />,
      title: 'Core Web Vitals',
      desc: 'LCP, INP, CLS metrics with Google PageSpeed Insights integration',
      color: 'from-amber-500/20 to-amber-600/10',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15',
    },
    {
      icon: <FileText className="size-5" />,
      title: 'On-Page & Content',
      desc: 'Title tags, meta descriptions, headings, keyword analysis & more',
      color: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15',
    },
    {
      icon: <Users className="size-5" />,
      title: 'CRO Analysis',
      desc: 'CTA detection, form friction, trust signals & conversion optimization',
      color: 'from-violet-500/20 to-violet-600/10',
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/15',
    },
    {
      icon: <Globe className="size-5" />,
      title: 'Local SEO',
      desc: 'Google Business Profile, NAP consistency & local search signals',
      color: 'from-cyan-500/20 to-cyan-600/10',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15',
    },
    {
      icon: <Sparkles className="size-5" />,
      title: 'AI SEO / E-E-A-T',
      desc: 'Author bios, topical clusters, content freshness & AI readiness',
      color: 'from-rose-500/20 to-rose-600/10',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/15',
    },
  ];

  const pricingPlans = [
    {
      name: 'DIY Plan',
      price: '$99',
      period: 'one-time',
      description: 'Perfect for developers and in-house teams',
      features: [
        'Full PDF with all fix guides',
        '30-day audit history',
        'Email support',
        'Quick Wins prioritization',
        'Module-by-module scoring',
        'Impact vs Effort matrix',
      ],
      cta: 'Get Started',
      popular: false,
      accent: 'border-white/10',
      badge: null,
    },
    {
      name: 'Strategy Plan',
      price: '$299',
      period: 'one-time',
      description: 'For businesses ready to take action',
      features: [
        'Everything in DIY Plan',
        '1-hour strategy call',
        'Competitor comparison report',
        'Priority email support',
        'Monthly re-audit reminder',
        'Custom action roadmap',
      ],
      cta: 'Get Strategy',
      popular: true,
      accent: 'border-primary/60',
      badge: 'Most Popular',
    },
    {
      name: 'Full Implementation',
      price: '$999',
      period: 'one-time',
      description: 'Done-for-you SEO overhaul',
      features: [
        'Everything in Strategy Plan',
        'Done-for-you fixes',
        'Monthly re-audit included',
        'Dedicated account manager',
        'Slack support channel',
        'White-label PDF reports',
      ],
      cta: 'Contact Sales',
      popular: false,
      accent: 'border-white/10',
      badge: null,
    },
  ];

  const faqs = [
    {
      q: 'How long does an SEO audit take?',
      a: 'Our audit typically completes in 60 seconds. We analyze up to 300 pages across 7 SEO modules including technical, on-page, performance, CRO, local SEO, AI/E-E-A-T, and schema markup.',
    },
    {
      q: 'What does the free audit include?',
      a: "The free audit provides a comprehensive overview of your site's SEO health with an overall score (0-100), individual module grades (A-F), and a list of detected issues with severity levels. Fix guides are available with the paid report.",
    },
    {
      q: 'How accurate are the audit results?',
      a: "Our audit engine uses the same methodology as Google's PageSpeed Insights and Lighthouse for performance metrics. Technical and on-page checks follow industry best practices aligned with Google's Search Quality Evaluator Guidelines.",
    },
    {
      q: 'What happens after I get my audit results?',
      a: 'You\'ll see a prioritized list of issues sorted by impact and effort. Focus on "Quick Wins" first — high-impact, low-effort fixes that deliver immediate improvements. The paid report includes detailed step-by-step fix guides for every issue.',
    },
    {
      q: 'Can I audit multiple websites?',
      a: "Yes! There's no limit to the number of websites you can audit. Create an account to keep track of all your audit history in one dashboard and monitor improvements over time.",
    },
    {
      q: 'How often should I run an audit?',
      a: 'We recommend running audits at least monthly, or after any significant website changes. The Strategy and Full Implementation plans include automated monthly re-audits so you can track your progress continuously.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director, SaaS Company',
      text: 'Increased our organic traffic by 143% in 3 months by following the prioritized action plan.',
      stars: 5,
      avatar: 'SC',
      highlight: '+143% Traffic',
    },
    {
      name: 'Marcus Rivera',
      role: 'E-commerce Owner',
      text: 'The Quick Wins feature alone helped us fix 12 critical issues in a single afternoon.',
      stars: 5,
      avatar: 'MR',
      highlight: '12 Issues Fixed',
    },
    {
      name: 'Emma Larsson',
      role: 'SEO Consultant',
      text: 'I run audits for every client through this platform. The reports save me hours of work every week.',
      stars: 5,
      avatar: 'EL',
      highlight: 'Hours Saved Weekly',
    },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const auditCount = pastAudits.length;
  const averageScore =
    auditCount > 0
      ? Math.round(pastAudits.reduce((sum, audit) => sum + audit.overallScore, 0) / auditCount)
      : 0;
  const trackedDomains = new Set(pastAudits.map((audit) => audit.domain.toLowerCase())).size;
  const issueCount = pastAudits.reduce((sum, audit) => {
    const modules = [
      audit.technical,
      audit.onPage,
      audit.performance,
      audit.cro,
      audit.localSeo,
      audit.aiSeo,
      audit.schema,
    ];
    return sum + modules.reduce((moduleSum, module) => moduleSum + (module?.issues.length ?? 0), 0);
  }, 0);

  const checkoutStatus = searchParams.get('checkout');

  return (
    <div className="min-h-screen flex flex-col bg-[#060B14]">
      <Header onScrollTo={scrollTo} user={sessionUser} onLogout={handleLogout} loggingOut={loggingOut} />

      {checkoutStatus && (
        <section className="border-b bg-muted/40">
          <div className="mx-auto max-w-4xl px-4 py-3 text-sm sm:px-6">
            {checkoutStatus === 'success' ? (
              <p className="text-emerald-700">Payment completed successfully. Your team can continue from your dashboard and inbox.</p>
            ) : (
              <p className="text-amber-700">Checkout was cancelled. Your saved checkout link can still be reopened from the email flow if mail delivery is configured.</p>
            )}
          </div>
        </section>
      )}

      {/* ─── HERO (UNCHANGED) ─────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center overflow-hidden border-b bg-[#0A0F1C] 
             bg-[linear-gradient(to_right,#1E293720_1px,transparent_1px),linear-gradient(to_bottom,#1E293720_1px,transparent_1px)] 
             bg-[size:50px_50px] relative"
      >
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] 
               bg-[size:80px_80px] pointer-events-none animate-[grid_80s_linear_infinite]"
        />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/15 blur-[140px] rounded-full" />
          <div className="absolute -top-32 left-20 w-[500px] h-[500px] bg-violet-500/10 blur-[110px] rounded-full" />
          <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-cyan-400/10 blur-[130px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-24 sm:py-32 text-center relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="secondary" className="mb-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-xl shadow-inner transition-all">
              <BarChart3 className="size-4 mr-2" />
              AI-Powered SEO Analysis
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-[1.05] text-white">
              Analyze Your SEO in{' '}
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                60 Seconds
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Get a complete SEO audit across 7 dimensions with prioritized fixes,
              quick wins, and a clear step-by-step guide — 100% free, no signup needed.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-primary transition-colors" />
                <Input
                  type="url"
                  placeholder="Enter your domain (e.g., example.com)"
                  className="pl-14 h-14 text-lg bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/40 backdrop-blur-xl rounded-2xl shadow-inner"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-10 text-base font-semibold bg-gradient-to-r from-primary to-cyan-500 hover:from-primary hover:to-cyan-600 text-white shadow-xl shadow-primary/40 rounded-2xl transition-all active:scale-[0.985]"
              >
                <Search className="size-5 mr-3" />
                Run Free Audit
              </Button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-sm text-white/60"
          >
            {['No signup required', '100% free report', '7 SEO modules', 'Instant results'].map((text) => (
              <span key={text} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                {text}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto border-t border-white/10 pt-10"
          >
            {[
              { value: auditCount > 0 ? auditCount.toLocaleString() : '0', label: 'Audits Completed' },
              { value: '7', label: 'SEO Dimensions' },
              { value: issueCount > 0 ? issueCount.toLocaleString() : '0', label: 'Issues Detected' },
              {
                value: trackedDomains > 0 ? `${averageScore}/100` : 'N/A',
                label: trackedDomains > 0 ? 'Avg. Score' : 'Score Coming Soon',
              },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl font-bold text-white tracking-tighter group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-white/50 mt-2">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES (REDESIGNED) ────────────────────────────────────── */}
      <section id="features" className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B14] via-[#0A1020] to-[#060B14]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-4 backdrop-blur">
              <div className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Comprehensive Analysis Engine
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
                Rank Higher
              </span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
              Our audit covers 7 critical SEO dimensions with actionable insights and prioritized recommendations
            </p>
          </motion.div>

          {/* Module weight pills */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-2 mb-14"
          >
            {(Object.keys(MODULE_CONFIG) as ModuleKey[]).map((key) => (
              <div
                key={key}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: MODULE_CONFIG[key].color }}
                />
                <span className="font-medium">{MODULE_CONFIG[key].label}</span>
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: MODULE_CONFIG[key].color + '22',
                    color: MODULE_CONFIG[key].color,
                  }}
                >
                  {MODULE_CONFIG[key].weight}%
                </span>
              </div>
            ))}
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 p-6"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center size-11 rounded-xl ${feature.iconBg} ${feature.iconColor} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>

                  <div className="mt-4 flex items-center gap-1 text-xs text-white/30 group-hover:text-white/60 transition-colors">
                    <span>Learn more</span>
                    <ChevronRight className="size-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (REDESIGNED) ────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B14] to-[#080D18]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-4 backdrop-blur">
              <Zap className="size-3 text-amber-400" />
              Simple 3-Step Process
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">How It Works</h2>
            <p className="text-white/50 text-lg">Three simple steps to dominate search results</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-14 left-[calc(33.33%-1px)] right-[calc(33.33%-1px)] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-0" />

            {[
              {
                step: '01',
                title: 'Enter Your Domain',
                desc: 'Type in any website URL. No signup, no credit card, no commitment required.',
                icon: <Globe className="size-6" />,
                color: 'from-blue-500 to-cyan-500',
                glow: 'shadow-blue-500/20',
              },
              {
                step: '02',
                title: 'Get Your Audit',
                desc: 'Our engine analyzes up to 300 pages across 7 SEO modules in under 60 seconds.',
                icon: <BarChart3 className="size-6" />,
                color: 'from-primary to-violet-500',
                glow: 'shadow-primary/20',
              },
              {
                step: '03',
                title: 'Fix & Improve',
                desc: 'Follow prioritized recommendations. Start with Quick Wins for immediate results.',
                icon: <Zap className="size-6" />,
                color: 'from-emerald-500 to-teal-500',
                glow: 'shadow-emerald-500/20',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative z-10"
              >
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-8 text-center hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300 group">
                  <div className={`relative inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br ${item.color} mb-6 shadow-xl ${item.glow} group-hover:scale-105 transition-transform`}>
                    <div className="text-white">{item.icon}</div>
                    <span className="absolute -top-2 -right-2 size-6 rounded-full bg-white text-[10px] font-bold text-gray-900 flex items-center justify-center shadow-sm">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING (REDESIGNED) ─────────────────────────────────────── */}
      <section id="pricing" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080D18] via-[#0A1020] to-[#080D18]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-4 backdrop-blur">
              <Award className="size-3 text-amber-400" />
              Simple, Transparent Pricing
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Choose Your Plan
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
              Start free, upgrade when you need detailed fix guides and expert guidance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-2xl border ${plan.popular ? 'border-primary/50' : 'border-white/8'} bg-white/[0.03] backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-300 ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <>
                    {/* Top glow for popular */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-primary/20 blur-xl" />
                  </>
                )}

                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-bold text-white tracking-tight">{plan.price}</span>
                      <span className="text-white/40 text-sm mb-2">{plan.period}</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/8 mb-6" />

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm">
                        <div className="size-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="size-3 text-emerald-400" />
                        </div>
                        <span className="text-white/70">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-11 font-semibold rounded-xl transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary to-cyan-500 hover:from-primary hover:to-cyan-600 text-white shadow-lg shadow-primary/30'
                        : 'bg-white/8 hover:bg-white/15 text-white border border-white/10'
                    }`}
                    onClick={() =>
                      startCommercialFlow(
                        plan.name === 'Strategy Plan'
                          ? 'strategy'
                          : plan.name === 'Full Implementation'
                            ? 'implementation'
                            : 'diy'
                      )
                    }
                    disabled={
                      commerceLoading === 'diy' ||
                      commerceLoading === 'strategy' ||
                      commerceLoading === 'implementation'
                    }
                  >
                    {commerceLoading &&
                    ((commerceLoading === 'diy' && plan.name === 'DIY Plan') ||
                      (commerceLoading === 'strategy' && plan.name === 'Strategy Plan') ||
                      (commerceLoading === 'implementation' && plan.name === 'Full Implementation'))
                      ? 'Opening...'
                      : plan.cta}
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (REDESIGNED) ────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080D18] to-[#060B14]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-4 backdrop-blur">
              <Star className="size-3 text-amber-400 fill-amber-400" />
              Trusted by Thousands
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Real Results,{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Real Growth
              </span>
            </h2>
            <p className="text-white/50 text-lg">See how teams have transformed their search rankings</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-8 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 group"
              >
                {/* Highlight badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <TrendingUp className="size-3 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold">{t.highlight}</span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-white/70 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary/40 to-cyan-500/40 border border-white/10 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ (REDESIGNED) ─────────────────────────────────────────── */}
      <section id="faq" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B14] to-[#080D18]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-4 backdrop-blur">
              <Search className="size-3 text-primary" />
              Got Questions?
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-white/50 text-lg">Everything you need to know about our SEO audit tool</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border border-white/8 rounded-xl bg-white/[0.03] backdrop-blur-sm px-6 overflow-hidden data-[state=open]:border-white/15 data-[state=open]:bg-white/[0.06] transition-all"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-white/80 hover:text-white hover:no-underline py-5 transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-white/50 leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA BANNER (REDESIGNED) ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-[#080D18] to-cyan-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/15 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs text-primary mb-6 backdrop-blur">
              <div className="size-1.5 rounded-full bg-primary animate-pulse" />
              Free — No Credit Card Required
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Ready to Dominate{' '}
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                Search Results?
              </span>
            </h2>
            <p className="text-white/60 mb-10 max-w-xl mx-auto text-lg">
              Run your free audit now and get instant, actionable recommendations to boost your organic traffic in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => scrollTo('hero')}
                className="h-14 px-10 text-base font-semibold bg-gradient-to-r from-primary to-cyan-500 hover:from-primary hover:to-cyan-600 text-white shadow-xl shadow-primary/30 rounded-xl"
              >
                <Search className="size-5 mr-2" />
                Start Free Audit
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo('pricing')}
                className="h-14 px-10 text-base font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 rounded-xl backdrop-blur"
              >
                <Phone className="size-5 mr-2" />
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── RECENT AUDITS ────────────────────────────────────────────── */}
      {sessionUser && pastAudits.length > 0 && (
        <section className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <AuditHistory audits={pastAudits} onSelectAudit={(a) => onAnalyze(a.id)} />
        </section>
      )}

      {/* ─── EXPLORE ROUTES (REDESIGNED) ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080D18] to-[#060B14]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-white text-xl font-bold mb-1">Explore Specialized Audit Routes</h3>
                <p className="text-white/50 text-sm">
                  These landing pages connect into the same live crawl, scoring, history, and PDF export pipeline.
                </p>
              </div>
              {sessionUser && (
                <Button asChild variant="outline" className="border-white/15 text-white/80 hover:bg-white/8 hover:text-white shrink-0">
                  <Link href="/history">Open Audit History</Link>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ['/seo-audit-tool', 'SEO Audit Tool'],
                ['/technical-seo-audit', 'Technical SEO Audit'],
                ['/ai-seo-audit', 'AI SEO Audit'],
                ['/local-seo-audit', 'Local SEO Audit'],
                ['/cro-audit', 'CRO Audit'],
              ].map(([href, label]) => (
                <Button
                  key={href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 rounded-lg transition-all"
                >
                  <Link href={href}>{label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#060B14]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <ContactSection />
        </div>
      </section>

      {/* ─── FOOTER (REDESIGNED) ──────────────────────────────────────── */}
      <footer className="relative overflow-hidden border-t border-white/8 mt-auto">
        <div className="absolute inset-0 bg-[#04080F]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 font-bold text-lg mb-4 text-white">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30">
                  <BarChart3 className="size-4 text-white" />
                </div>
                SEO Audit
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-6">
                Professional SEO audit platform trusted by thousands of businesses worldwide. Get actionable insights to improve your search rankings.
              </p>
              <div className="flex gap-2">
                {['★★★★★'].map((s, i) => (
                  <span key={i} className="text-amber-400 text-xs">{s}</span>
                ))}
                <span className="text-white/30 text-xs">4.9/5 rating</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                {sessionUser && <li><Link href="/history" className="hover:text-white transition-colors">Audit History</Link></li>}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Audit Modules</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><Link href="/technical-seo-audit" className="hover:text-white transition-colors">Technical SEO</Link></li>
                <li><Link href="/seo-audit-tool" className="hover:text-white transition-colors">Core Web Vitals</Link></li>
                <li><Link href="/seo-audit-tool" className="hover:text-white transition-colors">On-Page & Content</Link></li>
                <li><Link href="/cro-audit" className="hover:text-white transition-colors">CRO Analysis</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-white mb-4">Growth Pages</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><Link href="/ai-seo-audit" className="hover:text-white transition-colors">AI SEO Audit</Link></li>
                <li><Link href="/local-seo-audit" className="hover:text-white transition-colors">Local SEO Audit</Link></li>
                <li><Link href="/seo-audit-tool" className="hover:text-white transition-colors">SEO Audit Tool</Link></li>
                {sessionUser && <li><Link href="/history" className="hover:text-white transition-colors">Domain Trends</Link></li>}
              </ul>
            </div>
          </div>

          <div className="h-px bg-white/8 mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">&copy; 2025 SEO Audit Platform. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-white/30">
              <span className="hover:text-white/60 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      <LoginPromptModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}

// ============================================================
// Loading State (UNCHANGED)
// ============================================================

function LoadingState({ domain }: { domain: string }) {
  const steps = [
    'Connecting to server...',
    'Crawling website pages...',
    'Analyzing technical SEO...',
    'Checking Core Web Vitals...',
    'Evaluating on-page factors...',
    'Scanning CRO signals...',
    'Analyzing local SEO...',
    'Checking AI/E-E-A-T signals...',
    'Validating schema markup...',
    'Calculating scores...',
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mx-auto mb-6"
        >
          <BarChart3 className="size-12 text-primary" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Auditing {domain}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Running comprehensive SEO analysis across 7 modules
        </p>
        <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step}
              initial={{ opacity: 0.3, x: -8 }}
              animate={{
                opacity: idx <= activeStep ? 1 : 0.3,
                x: idx <= activeStep ? 0 : -8,
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              {idx < activeStep ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : idx === activeStep ? (
                <Loader2 className="size-4 text-primary animate-spin" />
              ) : (
                <div className="size-4 rounded-full border-2 border-muted-foreground/30" />
              )}
              <span className={`text-sm ${idx <= activeStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4"
        >
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================
// App Root (UNCHANGED)
// ============================================================

function HomeContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<AppView>('landing');
  const [currentAudit, setCurrentAudit] = useState<AuditData | null>(null);
  const [pendingAuditId, setPendingAuditId] = useState<string | null>(null);
  const [inputDomain, setInputDomain] = useState('');
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const isDevPaidPreview =
    process.env.NODE_ENV !== 'production' &&
    (searchParams.get('preview') === 'paid' || searchParams.get('fullFixes') === '1');
  const isPaid = process.env.NODE_ENV !== 'production' || isDevPaidPreview;

  const handleAnalyze = useCallback(async (domainOrId: string) => {
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
            id: data.id,
            domain: data.domain,
            status: data.status,
            overallScore: data.overallScore,
            technical: data.technical ?? modules.technical ?? null,
            onPage: data.onPage ?? modules.onPage ?? null,
            performance: data.performance ?? modules.performance ?? null,
            cro: data.cro ?? modules.cro ?? null,
            localSeo: data.localSeo ?? modules.localSeo ?? null,
            aiSeo: data.aiSeo ?? modules.aiSeo ?? null,
            schema: data.schema ?? modules.schema ?? null,
            createdAt: data.createdAt,
            errorMessage: data.errorMessage ?? null,
            isPartial: data.isPartial ?? false,
            partialReason: data.partialReason ?? null,
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
        body: JSON.stringify({ domain: domainOrId }),
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
        id: data.id,
        domain: data.domain,
        status: data.status,
        overallScore: data.overallScore,
        technical: modules?.technical ?? null,
        onPage: modules?.onPage ?? null,
        performance: modules?.performance ?? null,
        cro: modules?.cro ?? null,
        localSeo: modules?.localSeo ?? null,
        aiSeo: modules?.aiSeo ?? null,
        schema: modules?.schema ?? null,
        createdAt: data.createdAt,
        errorMessage: data.errorMessage ?? null,
        isPartial: data.isPartial ?? false,
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
      const timeoutId = window.setTimeout(() => {
        void handleAnalyze(auditId);
      }, 0);
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
            id: data.id,
            domain: data.domain,
            status: data.status,
            overallScore: data.overallScore,
            technical: data.technical ?? modules.technical ?? null,
            onPage: data.onPage ?? modules.onPage ?? null,
            performance: data.performance ?? modules.performance ?? null,
            cro: data.cro ?? modules.cro ?? null,
            localSeo: data.localSeo ?? modules.localSeo ?? null,
            aiSeo: data.aiSeo ?? modules.aiSeo ?? null,
            schema: data.schema ?? modules.schema ?? null,
            createdAt: data.createdAt,
            errorMessage: data.errorMessage ?? null,
            isPartial: data.isPartial ?? false,
            partialReason: data.partialReason ?? null,
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
          timeoutId = window.setTimeout(() => {
            void pollAudit();
          }, pollDelayMs);
        }
      }
    };

    void pollAudit();

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [view, pendingAuditId]);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LandingPage onAnalyze={handleAnalyze} />
          </motion.div>
        )}

        {view === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoadingState domain={inputDomain} />
          </motion.div>
        )}

        {view === 'dashboard' && currentAudit && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AuditDashboard
              audit={currentAudit}
              onBack={handleBack}
              isPaid={isPaid}
              onUpgradeClick={() => setShowLeadDialog(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <LeadCaptureDialog
        open={showLeadDialog}
        onOpenChange={setShowLeadDialog}
        auditId={currentAudit?.id}
        domain={currentAudit?.domain}
      />
    </div>
  );
}
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
