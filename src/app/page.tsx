'use client';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';
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
  User,
  Users,
  Sparkles,
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
import { ContactSection } from '@/components/seo/ContactSection';
import type { AppView, AuditData, ModuleKey } from '@/lib/types';
import { MODULE_CONFIG } from '@/lib/types';
import { getSupportWhatsappUrl } from '@/lib/support';
import { motion, AnimatePresence } from 'framer-motion';

function readInitialSearchParams() {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.search);
}

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
      display: inline-block;
      color: transparent;
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
      background: linear-gradient(135deg, rgba(251,146,60,0.12), rgba(254,241,199,0.18));
      border-color: rgba(251,146,60,0.22);
      box-shadow: 0 24px 54px rgba(251,146,60,0.08);
    }
    .testimonial-card::before {
      content: '"';
      font-family: var(--font-display);
      position: absolute;
      top: -10px;
      left: 18px;
      font-size: 80px;
      color: rgba(251,146,60,0.16);
      font-weight: 800;
      line-height: 1;
      pointer-events: none;
      transform: rotate(-12deg);
    }
    .testimonial-carousel {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .testimonial-carousel::-webkit-scrollbar {
      display: none;
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

// Landing Page
// ============================================================
function LandingPage({ onAnalyze }: { onAnalyze: (domain: string, email?: string) => void }) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [pastAudits, setPastAudits] = useState<AuditData[]>([]);
  const [commerceLoading, setCommerceLoading] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchParams] = useState(readInitialSearchParams);
  const bookingUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/dexora/30min';

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
      if (flow === 'implementation') {
        window.location.assign(getSupportWhatsappUrl(
          `Hi, I want help with the full SEO implementation plan${url ? ` for ${url}` : ''}.`
        ));
        return;
      }

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
        window.location.assign(data.url);
        return;
      }
      const response = await fetch('/api/commercial/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'diy' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.assign(data.url);
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
      name: 'Free Plan', price: '$0', period: 'preview',
      description: 'Run a fast audit preview and see your highest-priority SEO opportunities',
      features: ['Free audit preview', 'Top issues summary', 'Quick Wins preview', 'Preview PDF by email', 'Basic module scores', 'Login to unlock full details'],
      cta: 'Start Free', popular: false,
    },
    {
      name: 'DIY Plan', price: '$99', period: 'one-time',
      description: 'Perfect for developers and in-house teams that want the full fix plan',
      features: ['Full PDF with all fix guides', '30-day audit history', 'Email support', 'Quick Wins prioritization', 'Module-by-module scoring', 'Impact vs Effort matrix'],
      cta: 'Get Started', popular: true,
    },
    {
      name: 'Strategy Plan', price: '$129', period: 'one-time',
      description: 'For businesses that want expert guidance and a clear action roadmap',
      features: ['Everything in DIY Plan', 'Strategy call booking', 'Competitor comparison report', 'Priority email support', 'Monthly re-audit reminder', 'Custom action roadmap'],
      cta: 'Get Strategy', popular: false,
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
    { name: 'Tim Simon', role: 'Simons Group LLC', text: 'Working with Taqweem has been a pleasure. He and his team are thoughtful and responsive about how they develop sites. Communication is continuous, and he listens intently. He is comfortable offering suggestions that enhance your ideas without increasing cost. ', stars: 5 },
    { name: 'Matts Mankse', role: '4BSF', text: 'Ive been working with this team for about a year now. Every time I do a project they are responsive, respectful and deliver high quality work. I would recommend them to anyone needing their services.', stars: 5 },
    { name: 'Sky ', role: 'Legend Mover For You', text: 'Legend Movers 4 You Professional, responsive, and highly knowledgeable. Dexora explained everything clearly and delivered exactly what was promised. Because of the experience, we moved forward with ongoing SEO services', stars: 5 },
    { name: 'Julie Slagt', role: 'Alpha Strategies Agency', text: 'Great experience from start to finish. The quality of the monthly local SEO, GEO, and AEO work is outstanding, and everything is handled with care and expertise. You can clearly tell they have strong knowledge of local search optimization. Communication is clear and professional, and they’re always responsive and helpful. I genuinely enjoy collaborating with them and appreciate their long-term, results-driven approach. Highly recommended excellent service and support!', stars: 5 },
    { name: 'Mehmat', role: 'Capital Kitchen & Bath', text: 'I got a result that far exceeded my expectations, and I want to thank the team very much. They worked meticulously and understood our needs, delivering exactly what we wanted. I definitely recommend them.					', stars: 5 },
    { name: 'Lena Kim', role: 'Content Strategist', text: 'Fast, actionable insights with an attractive dashboard that makes follow-up simple.', stars: 5 },
  ];

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (!carouselRef.current) return;
      const card = carouselRef.current.querySelector<HTMLElement>('.testimonial-card-wrapper');
      if (!card) return;
      const gap = 20;
      const visible = Math.max(1, Math.floor(carouselRef.current.clientWidth / (card.offsetWidth + gap)));
      setVisibleCount(Math.min(4, visible));
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;

    const handleScroll = () => {
      const card = node.querySelector<HTMLElement>('.testimonial-card-wrapper');
      if (!card) return;
      const gap = 20;
      const index = Math.round(node.scrollLeft / (card.offsetWidth + gap));
      setCarouselIndex(Math.max(0, Math.min(index, testimonials.length - visibleCount)));
    };

    node.addEventListener('scroll', handleScroll, { passive: true });
    return () => node.removeEventListener('scroll', handleScroll);
  }, [visibleCount, testimonials.length]);

  const advanceTestimonials = (direction: number) => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.querySelector<HTMLElement>('.testimonial-card-wrapper');
    if (!card) return;
    const gap = 20;
    const targetIndex = Math.max(0, Math.min(testimonials.length - visibleCount, carouselIndex + direction));
    const offset = targetIndex * (card.offsetWidth + gap);
    carouselRef.current.scrollTo({ left: offset, behavior: 'smooth' });
    setCarouselIndex(targetIndex);
  };

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
      <section id="hero" className="relative overflow-hidden border-b border-white/10 bg-black text-white">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.22),transparent_36%),linear-gradient(180deg,rgba(0,0,0,0.45),#000_82%)]" />
        {/* Accent blobs */}
        <div className="absolute top-20 left-1/4 size-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 size-48 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

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
                className="mb-2 gap-2 rounded-full border border-orange-300/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-orange-200 shadow-sm backdrop-blur"
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
              Your Website Has Hidden Issues Costing You Traffic.{' '}
              <span className="relative inline-block">
                <span className="text-orange-200">Find Them in 60 Seconds.</span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-300/80 to-orange-500/20 rounded-full" />
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Free all-in-one audit covering Technical SEO, CRO, Local SEO, AI Visibility, Core Web Vitals, and Schema. No credit card required.

            </motion.p>

            {/* Search form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 max-w-2xl mx-auto"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_auto]">
                <div className="relative flex-1 group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors group-focus-within:text-orange-300" />
                  <Input
                    type="url"
                    placeholder="Enter your domain (e.g., example.com)"
                    className="pl-11 h-13 text-base rounded-2xl border-white/15 bg-white/95 text-slate-950 placeholder:text-slate-500 shadow-xl shadow-black/20 transition-all focus:border-orange-300 focus:bg-white focus:shadow-orange-500/10"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ height: '52px' }}
                    required
                  />
                </div>
                <div className="relative flex-1 group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors group-focus-within:text-orange-300" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-11 h-13 text-base rounded-2xl border-white/15 bg-white/95 text-slate-950 placeholder:text-slate-500 shadow-xl shadow-black/20 transition-all focus:border-orange-300 focus:bg-white focus:shadow-orange-500/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ height: '52px' }}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-13 gap-2 rounded-2xl bg-orange-500 px-7 font-semibold text-white shadow-xl shadow-orange-950/40 transition-all hover:bg-orange-400 hover:shadow-orange-500/20"
                  style={{ height: '52px' }}
                >
                  <Search className="size-4" />
                  Run Free Audit Now
                </Button>
              </div>
            </motion.form>

            {/* Trust badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {['URL + email required', 'Preview PDF emailed automatically', ' 2,000 plus audits completed',"No credit card required", 'Full report after login'].map((text) => (
                <span key={text} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs text-slate-300 backdrop-blur">
                  <CheckCircle2 className="size-3 text-emerald-300" />
                  {text}
                </span>
              ))}
            </motion.div>

            {/* Stats */}
            {/* <motion.div variants={itemVariants} className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { value: auditCount > 0 ? auditCount.toLocaleString() : '0', label: 'Audits Stored', icon: <BarChart3 className="size-4" /> },
                { value: '7', label: 'SEO Modules', icon: <Shield className="size-4" /> },
                { value: issueCount > 0 ? issueCount.toLocaleString() : '0', label: 'Issues Logged', icon: <TrendingUp className="size-4" /> },
                { value: trackedDomains > 0 ? `${averageScore}/100` : 'N/A', label: trackedDomains > 0 ? 'Avg Score' : 'Score Pending', icon: <Award className="size-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="group cursor-default rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-center shadow-2xl shadow-black/20 backdrop-blur transition hover:border-orange-300/30 hover:bg-white/[0.09]">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-slate-400 group-hover:text-orange-200 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div> */}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 overflow-hidden"
      >
        {/* Soft Background Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-[#3AE7AF]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-120px] right-[-80px] w-[300px] h-[300px] bg-purple-400/10 blur-[120px] rounded-full" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge className="mb-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#3AE7AF]/20 text-[#1f2937]">
            Comprehensive Analysis
          </Badge>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
            }}
            className="text-3xl sm:text-5xl mb-4 text-gray-900"
          >
            Everything You Need to Rank Higher
          </h2>

          <p className="text-gray-600 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
            Our audit covers 7 critical SEO dimensions with actionable insights and
            prioritized recommendations
          </p>
        </motion.div>

        {/* Module Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
        >
          {(Object.keys(MODULE_CONFIG) as ModuleKey[]).map((key) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs shadow-sm hover:shadow-md hover:scale-[1.05] transition-all duration-300"
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: MODULE_CONFIG[key].color }}
              />
              <span className="font-medium text-gray-800">
                {MODULE_CONFIG[key].label}
              </span>
              <span className="text-[10px] font-semibold bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                {MODULE_CONFIG[key].weight}%
              </span>
            </div>
          ))}
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.45 }}
            >
              <Card className="group relative h-full border border-gray-200 bg-white rounded-2xl overflow-hidden hover:border-[#3AE7AF]/40 hover:shadow-lg transition-all duration-300">

                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-[#3AE7AF]/5" />

                <CardContent className="flex items-start gap-4 p-6 relative z-10">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl ${feature.bg} ${feature.color} shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <h3
                      className="font-semibold text-sm mb-2 text-gray-900"
                      style={{
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative overflow-hidden bg-white border-y border-slate-200 text-slate-900">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-200/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-60 w-60 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(253,186,116,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.1),transparent_25%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2 rounded-full bg-slate-900 text-white border border-slate-200">
              Workflow Reimagined
            </Badge>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-3xl sm:text-4xl mb-4 text-slate-950">
              A fresh way to audit, act, and win
            </h2>
            <p className="text-slate-600">
              A modern 3-step journey optimized for speed, clarity, and measurable SEO growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              { step: '01', title: 'Enter Your Domain', desc: 'Paste your website URL and get started instantly. No signup required to preview your audit.', icon: <Globe className="size-6" />, color: 'text-blue-600', bg: 'bg-blue-100', accent: 'from-blue-500 to-sky-500' },
              { step: '02', title: 'See Instant Insights', desc: 'Our engine analyzes up to 300 pages, surface high-impact issues, and prioritize what matters first.', icon: <BarChart3 className="size-6" />, color: 'text-violet-600', bg: 'bg-violet-100', accent: 'from-violet-500 to-fuchsia-500' },
              { step: '03', title: 'Fix With Confidence', desc: 'Get clear next steps, Quick Wins, and a roadmap that turns audit findings into real SEO gains.', icon: <Zap className="size-6" />, color: 'text-emerald-600', bg: 'bg-emerald-100', accent: 'from-emerald-500 to-teal-500' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.45 }}
                className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-lg shadow-slate-200/40 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900 via-slate-500 to-slate-400 opacity-80" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className={`size-14 grid place-items-center rounded-[26px] ${item.bg} ${item.color} ring-1 ring-slate-200 shadow-sm`}>
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Step {item.step}</span>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                      {item.title}
                    </h3>
                  </div>
                </div>
                <p className="relative z-10 mt-6 text-sm leading-relaxed text-slate-600">
                  {item.desc}
                </p>
                <div className="relative z-10 mt-8 flex flex-wrap gap-2">
                  {['Fast', 'Clear', 'Actionable'].map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-slate-600 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pointer-events-none absolute -right-10 top-12 h-28 w-28 rounded-full bg-slate-100 blur-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-3 rounded-full border-orange-300/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-orange-200">Simple Pricing</Badge>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-3xl sm:text-4xl mb-3">
            Choose Your Plan
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto">
            Start free, upgrade when you need detailed fix guides and expert guidance
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
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
                ? 'border-orange-300/40 bg-white text-slate-950 shadow-2xl shadow-orange-950/30'
                : 'border-white/10 bg-white/[0.06] text-white shadow-xl shadow-black/20 backdrop-blur'
                }`}>
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-300" />
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-full">
                      <div className="bg-orange-500 text-white text-xs font-semibold px-4 py-1 rounded-t-lg shadow-sm">
                        Most Popular
                      </div>
                    </div>
                  </>
                )}
                <CardHeader className="pb-0 pt-6 px-6">
                  <CardTitle style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }} className="text-lg">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className={`text-xs leading-relaxed ${plan.popular ? 'text-slate-600' : 'text-slate-300'}`}>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 px-6 flex-1">
                  <div className="mb-5 flex items-end gap-1.5">
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em' }} className="text-4xl">{plan.price}</span>
                    <span className={`mb-1 text-sm ${plan.popular ? 'text-slate-500' : 'text-slate-400'}`}>{plan.period}</span>
                  </div>
                  <Separator className={`mb-5 ${plan.popular ? '' : 'bg-white/10'}`} />
                  <ul className="space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${plan.popular ? 'text-orange-500' : 'text-emerald-300'}`} />
                        <span className={plan.popular ? 'text-slate-600' : 'text-slate-300'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-4">
                  <Button
                    className={`w-full rounded-xl font-semibold gap-2 transition-all ${plan.popular
                      ? 'bg-orange-500 text-white shadow-md hover:bg-orange-400 hover:shadow-lg'
                      : 'border-white/15 bg-white/10 text-white hover:bg-white hover:text-black'
                      }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => {
                      if (plan.name === 'Free Plan') {
                        scrollTo('hero');
                        return;
                      }
                      if (plan.name === 'DIY Plan') {
                        window.location.assign(bookingUrl);
                        return;
                      }
                      void startCommercialFlow('strategy');
                    }}
                    disabled={!!commerceLoading}
                  >
                    {commerceLoading && ((commerceLoading === 'diy' && plan.name === 'DIY Plan') || (commerceLoading === 'strategy' && plan.name === 'Strategy Plan'))
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
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

          <div className="relative pt-5">
            <div className="overflow-hidden pt-6">
              <div
                ref={carouselRef}
                className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory touch-pan-x scroll-smooth testimonial-carousel"
              >
                {testimonials.map((t, idx) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, duration: 0.45 }}
                    className="testimonial-card-wrapper snap-start flex-shrink-0 w-[90%] sm:w-[48%] lg:w-[31%] xl:w-[23%]"
                  >
                    <Card className="card-premium relative h-full py-0 gap-0 overflow-hidden border border-orange-200/70 bg-gradient-to-br from-orange-100 via-orange-50 to-white testimonial-card">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
                      <CardContent className="p-6 pt-8">
                         <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-200 flex items-center justify-center text-orange-900 font-bold text-sm shrink-0" style={{ fontFamily: 'var(--font-display)' }}>
                            {t.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{t.name}</p>
                            <p className="text-xs text-slate-500">{t.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 mb-2 mt-2">
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700 mb-5 italic">"{t.text}"</p>
                       
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="outline"
                className="h-11 w-11 rounded-full border border-orange-300/40 bg-white/10 text-orange-700 shadow-sm shadow-black/5 hover:bg-orange-50"
                onClick={() => advanceTestimonials(-1)}
                disabled={carouselIndex <= 0}
                aria-label="Previous testimonials"
              >
                <ChevronRight className="size-4 rotate-180" />
              </Button>
              <Button
                variant="outline"
                className="h-11 w-11 rounded-full border border-orange-300/40 bg-white/10 text-orange-700 shadow-sm shadow-black/5 hover:bg-orange-50"
                onClick={() => advanceTestimonials(1)}
                disabled={carouselIndex >= testimonials.length - visibleCount}
                aria-label="Next testimonials"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
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
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <AuditHistory audits={pastAudits} limit={3} variant="cards" onSelectAudit={(a) => onAnalyze(a.id)} />
        </section>
      )}

      {/* ── CONTACT ── */}
      <section id="contact" className="border-y bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <ContactSection />
        </div>
      </section>

      {/* ── SPECIALIZED ROUTES ── */}
      {/* <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
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
      </section> */}

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
export default function Home() {
  const [view, setView] = useState<AppView>('landing');
  const [currentAudit, setCurrentAudit] = useState<AuditData | null>(null);
  const [pendingAuditId, setPendingAuditId] = useState<string | null>(null);
  const [inputDomain, setInputDomain] = useState('');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [searchParams] = useState(readInitialSearchParams);

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
              onUpgradeClick={() => window.location.assign('/contact')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
