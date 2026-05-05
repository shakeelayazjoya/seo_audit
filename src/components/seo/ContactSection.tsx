'use client';

import { useState } from 'react';
import { Loader2, Mail, Phone, Send, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
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
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Support</p>
          <h2 className="text-2xl font-semibold text-slate-950">Contact us</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Send your question, audit URL, or implementation request. We will reply by email or WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="gap-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <Phone className="size-4" />
              WhatsApp
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
            <a href={`mailto:${supportEmail}`}>
              <Mail className="size-4" />
              {supportEmail}
            </a>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="text-sm text-slate-800">Name <span className="text-slate-400">(optional)</span></Label>
              <div className="relative">
                <User2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className="h-10 border-slate-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-sm text-slate-800">Email</Label>
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
                  className="h-10 border-slate-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone" className="text-sm text-slate-800">Phone number <span className="text-slate-400">(optional)</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                  className="h-10 border-slate-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400"
                  placeholder="+358 44 9568407"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="contact-message" className="text-sm text-slate-800">Message</Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError('');
              }}
              className="min-h-24 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400"
              placeholder="Tell us how we can help."
              disabled={loading}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            </div>

          <Button
            type="submit"
              className="w-full justify-center gap-2 rounded-lg bg-slate-950 text-white hover:bg-slate-800 sm:w-auto"
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
          </div>
      </form>
    </div>
  );
}
