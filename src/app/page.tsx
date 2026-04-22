'use client';

import { useState, useCallback, useEffect } from 'react';
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
import type { AppView, AuditData, ModuleKey } from '@/lib/types';
import { MODULE_CONFIG } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// Header / Navigation
// ============================================================

function Header({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'Features', id: 'features' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="size-4 text-primary-foreground" />
          </div>
          <span>SEO Audit</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => onScrollTo(l.id)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </button>
          ))}
          <Button size="sm" onClick={() => onScrollTo('hero')}>
            <Search className="size-3.5 mr-1.5" />
            Free Audit
          </Button>
        </nav>

        {/* Mobile menu toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
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
            className="md:hidden overflow-hidden border-t"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { onScrollTo(l.id); setMobileOpen(false); }}
                  className="block w-full text-left text-sm py-2 hover:text-foreground text-muted-foreground"
                >
                  {l.label}
                </button>
              ))}
              <Button size="sm" className="w-full" onClick={() => { onScrollTo('hero'); setMobileOpen(false); }}>
                <Search className="size-3.5 mr-1.5" />
                Free Audit
              </Button>
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

  useEffect(() => {
    fetch('/api/audits')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((a: Record<string, unknown>) => ({
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
          }));
          setPastAudits(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAnalyze(url.trim());
  };

  const features = [
    {
      icon: <Shield className="size-5" />,
      title: 'Technical SEO Audit',
      desc: 'SSL, sitemaps, crawlability, structured data & 40+ technical checks',
    },
    {
      icon: <Zap className="size-5" />,
      title: 'Core Web Vitals',
      desc: 'LCP, INP, CLS metrics with Google PageSpeed Insights integration',
    },
    {
      icon: <FileText className="size-5" />,
      title: 'On-Page & Content',
      desc: 'Title tags, meta descriptions, headings, keyword analysis & more',
    },
    {
      icon: <Users className="size-5" />,
      title: 'CRO Analysis',
      desc: 'CTA detection, form friction, trust signals & conversion optimization',
    },
    {
      icon: <Globe className="size-5" />,
      title: 'Local SEO',
      desc: 'Google Business Profile, NAP consistency & local search signals',
    },
    {
      icon: <Sparkles className="size-5" />,
      title: 'AI SEO / E-E-A-T',
      desc: 'Author bios, topical clusters, content freshness & AI readiness',
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
    },
  ];

  const faqs = [
    {
      q: 'How long does an SEO audit take?',
      a: 'Our audit typically completes in 60 seconds. We analyze up to 300 pages across 7 SEO modules including technical, on-page, performance, CRO, local SEO, AI/E-E-A-T, and schema markup.',
    },
    {
      q: 'What does the free audit include?',
      a: 'The free audit provides a comprehensive overview of your site\'s SEO health with an overall score (0-100), individual module grades (A-F), and a list of detected issues with severity levels. Fix guides are available with the paid report.',
    },
    {
      q: 'How accurate are the audit results?',
      a: 'Our audit engine uses the same methodology as Google\'s PageSpeed Insights and Lighthouse for performance metrics. Technical and on-page checks follow industry best practices aligned with Google\'s Search Quality Evaluator Guidelines.',
    },
    {
      q: 'What happens after I get my audit results?',
      a: 'You\'ll see a prioritized list of issues sorted by impact and effort. Focus on "Quick Wins" first — high-impact, low-effort fixes that deliver immediate improvements. The paid report includes detailed step-by-step fix guides for every issue.',
    },
    {
      q: 'Can I audit multiple websites?',
      a: 'Yes! There\'s no limit to the number of websites you can audit. Create an account to keep track of all your audit history in one dashboard and monitor improvements over time.',
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
    },
    {
      name: 'Marcus Rivera',
      role: 'E-commerce Owner',
      text: 'The Quick Wins feature alone helped us fix 12 critical issues in a single afternoon.',
      stars: 5,
    },
    {
      name: 'Emma Larsson',
      role: 'SEO Consultant',
      text: 'I run audits for every client through this platform. The reports save me hours of work every week.',
      stars: 5,
    },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onScrollTo={scrollTo} />

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4">
              <BarChart3 className="size-3 mr-1" />
              AI-Powered SEO Analysis
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
              Analyze Your SEO in{' '}
              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md">60 Seconds</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get a comprehensive SEO audit across 7 dimensions with prioritized action items,
              quick wins, and a step-by-step fix guide — completely free.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Enter your domain (e.g., example.com)"
                className="pl-10 h-12 text-base"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">
              <Search className="size-4 mr-2" />
              Free Audit
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-muted-foreground"
          >
            {['No signup required', '100% free report', '7 SEO modules', 'Instant results'].map((text) => (
              <span key={text} className="flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-500" />
                {text}
              </span>
            ))}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {[
              { value: '50K+', label: 'Audits Run' },
              { value: '7', label: 'SEO Modules' },
              { value: '2.5M+', label: 'Issues Found' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-3">Comprehensive Analysis</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Everything You Need to Rank Higher</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our audit covers 7 critical SEO dimensions with actionable insights and prioritized recommendations
          </p>
        </motion.div>

        {/* Module weights display */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          {(Object.keys(MODULE_CONFIG) as ModuleKey[]).map((key) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: MODULE_CONFIG[key].color }}
              />
              <span className="font-medium">{MODULE_CONFIG[key].label}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {MODULE_CONFIG[key].weight}%
              </Badge>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-foreground/20 py-0 gap-0">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/40 border-y">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to improve your SEO</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter Your Domain',
                desc: 'Type in any website URL. No signup, no credit card, no commitment required.',
                icon: <Globe className="size-5" />,
              },
              {
                step: '02',
                title: 'Get Your Audit',
                desc: 'Our engine analyzes up to 300 pages across 7 SEO modules in under 60 seconds.',
                icon: <BarChart3 className="size-5" />,
              },
              {
                step: '03',
                title: 'Fix & Improve',
                desc: 'Follow prioritized recommendations. Start with Quick Wins for immediate results.',
                icon: <Zap className="size-5" />,
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary mb-4">
                  {item.icon}
                  <span className="absolute -top-1 -right-1 size-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-3">Simple Pricing</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need detailed fix guides and expert guidance
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col py-0 gap-0 ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  <Separator className="mb-4" />
                  <ul className="space-y-2.5">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => scrollTo('hero')}
                  >
                    {plan.cta}
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 border-y">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Trusted by Thousands of Teams</h2>
            <p className="text-muted-foreground">See how others have improved their search rankings</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full py-0 gap-0">
                  <CardContent className="p-5">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                    <Separator className="mb-3" />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about our SEO audit tool</p>
        </motion.div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`}>
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="bg-muted/40 border-y">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Improve Your Rankings?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Run your free audit now and get instant, actionable recommendations to boost your organic traffic.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => scrollTo('hero')}>
                <Search className="size-4 mr-2" />
                Start Free Audit
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo('pricing')}>
                <Phone className="size-4 mr-2" />
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Audits */}
      {pastAudits.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <AuditHistory audits={pastAudits} onSelectAudit={(a) => onAnalyze(a.id)} />
        </section>
      )}

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-3">
                <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                  <BarChart3 className="size-3.5 text-primary-foreground" />
                </div>
                SEO Audit
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Professional SEO audit platform trusted by thousands of businesses worldwide. Get actionable insights to improve your search rankings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><button onClick={() => scrollTo('features')} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollTo('faq')} className="hover:text-foreground transition-colors">FAQ</button></li>
                <li><span className="hover:text-foreground cursor-pointer transition-colors">Changelog</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Audit Modules</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><span className="hover:text-foreground cursor-pointer transition-colors">Technical SEO</span></li>
                <li><span className="hover:text-foreground cursor-pointer transition-colors">Core Web Vitals</span></li>
                <li><span className="hover:text-foreground cursor-pointer transition-colors">On-Page & Content</span></li>
                <li><span className="hover:text-foreground cursor-pointer transition-colors">CRO Analysis</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><span className="hover:text-foreground cursor-pointer transition-colors">About Us</span></li>
                <li><span className="hover:text-foreground cursor-pointer transition-colors">Blog</span></li>
                <li><span className="hover:text-foreground cursor-pointer transition-colors">Careers</span></li>
                <li><span className="hover:text-foreground cursor-pointer transition-colors">Contact</span></li>
              </ul>
            </div>
          </div>
          <Separator className="mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>&copy; 2025 SEO Audit Platform. All rights reserved.</p>
            <div className="flex gap-4">
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
// App Root
// ============================================================

export default function Home() {
  const [view, setView] = useState<AppView>('landing');
  const [currentAudit, setCurrentAudit] = useState<AuditData | null>(null);
  const [inputDomain, setInputDomain] = useState('');
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handleAnalyze = useCallback(async (domainOrId: string) => {
    setInputDomain(domainOrId);
    setView('loading');

    try {
      // If it looks like an ID (cuid format), fetch existing audit
      if (domainOrId.length > 20 && !domainOrId.includes('.')) {
        const res = await fetch(`/api/audit/${domainOrId}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentAudit({
            id: data.id,
            domain: data.domain,
            status: data.status,
            overallScore: data.overallScore,
            technical: data.technical ?? null,
            onPage: data.onPage ?? null,
            performance: data.performance ?? null,
            cro: data.cro ?? null,
            localSeo: data.localSeo ?? null,
            aiSeo: data.aiSeo ?? null,
            schema: data.schema ?? null,
            createdAt: data.createdAt,
          });
          setView('dashboard');
          return;
        }
      }

      // Otherwise, start a new audit
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
      });
      setView('dashboard');
    } catch (err) {
      console.error('Audit error:', err);
      setView('landing');
    }
  }, []);

  const handleBack = useCallback(() => {
    setView('landing');
    setCurrentAudit(null);
  }, []);

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
