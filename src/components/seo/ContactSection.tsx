'use client';

import { useState } from 'react';
import { Loader2, Mail, Phone, Send, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSupportEmail, getSupportWhatsappUrl } from '@/lib/support';

export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supportEmail = getSupportEmail();
  const whatsappUrl = getSupportWhatsappUrl('Hi, I need help with my SEO audit.');

  const validateForm = () => {
    if (!name.trim()) return 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (!phone.trim()) return 'Phone number is required.';
    if (message.trim().length < 10) return 'Message must be at least 10 characters.';
    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to send your message right now.');
      }

      setSuccess('Your message has been sent. We will get back to you shortly.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to send your message right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-7xl overflow-hidden border border-slate-200 bg-white shadow-2xl">
      <CardHeader className="px-8 py-8">
        <CardTitle className="text-3xl text-slate-950">Contact us</CardTitle>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Need help with your audit, implementation, or a custom SEO plan? Send us a message and our team will get back to you within one business day.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild size="sm" variant="secondary" className="gap-2">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <Phone className="size-4" />
              WhatsApp support
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10">
            <a href={`mailto:${supportEmail}`}>
              <Mail className="size-4" />
              {supportEmail}
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-8 px-8 py-8 lg:grid-cols-[1.05fr_1fr] lg:items-start bg-white">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Let’s talk</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">We’re here to help you grow.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Whether you need a quick audit review, implementation support, or a custom SEO strategy, our team is ready to support your next move.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <Phone className="size-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-slate-950">Phone</p>
                <p className="text-sm text-slate-700">+1 (x`555) 555-5555</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <Mail className="size-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-slate-950">Email</p>
                <p className="text-sm text-slate-700">support@example.com</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">What to include</p>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li>• Your website URL</li>
              <li>• A short summary of your goals</li>
              <li>• Any specific SEO questions or deadlines</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="text-slate-950">Name</Label>
              <div className="relative">
                <User2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className="border-slate-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-slate-950">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="border-slate-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="text-slate-950">Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="contact-phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError('');
                }}
                className="border-slate-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400"
                placeholder="+1 555 555 5555"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message" className="text-slate-950">Message</Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError('');
              }}
              className="min-h-32 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400"
              placeholder="Tell us how we can help."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
          </div>

          <Button
            type="submit"
            className="w-full justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-400"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
