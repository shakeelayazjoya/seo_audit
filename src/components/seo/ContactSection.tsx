'use client';

import { useState } from 'react';
import { Loader2, Mail, Phone, Send, User2, MessageSquare } from 'lucide-react';
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) 
      return 'Please enter a valid email address.';
    if (message.trim().length < 10) 
      return 'Message must be at least 10 characters.';
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

      setSuccess('Thank you! Your message has been received. We’ll reply soon.');
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
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600 mb-4">
          <MessageSquare className="size-4" />
          GET IN TOUCH
        </div>
        <h2 className="text-4xl font-semibold tracking-tight text-slate-950 mb-4">
          Let&apos;s start a conversation
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Have questions about your SEO audit, need implementation help, or just want to say hello? 
          We reply fast via email and WhatsApp.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
        {/* Left Info Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-white h-full flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-3">Ready to grow your organic traffic?</h3>
              <p className="text-slate-400">
                Our team typically replies within a few hours during business days.
              </p>
            </div>

            <div className="space-y-6 mt-auto">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Phone className="size-6 text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Chat on WhatsApp</p>
                  <p className="text-sm text-slate-400">Instant support available</p>
                </div>
              </a>

              <a 
                href={`mailto:${supportEmail}`} 
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="size-6 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Send us an email</p>
                  <p className="text-sm text-slate-400 break-all">{supportEmail}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-slate-700">Name <span className="text-slate-400 text-xs">(optional)</span></Label>
                  <div className="relative">
                    <User2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <Input
                      id="contact-name"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                      className="h-12 border-slate-200 pl-11 focus:border-slate-400 rounded-xl"
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-slate-700">Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <Input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                      className="h-12 border-slate-200 pl-11 focus:border-slate-400 rounded-xl"
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-slate-700">Phone number <span className="text-slate-400 text-xs">(optional)</span></Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                  <Input
                    id="contact-phone"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (error) setError(''); }}
                    className="h-12 border-slate-200 pl-11 focus:border-slate-400 rounded-xl"
                    placeholder="+92 300 1234567"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-slate-700">How can we help you? <span className="text-red-500">*</span></Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); if (error) setError(''); }}
                  className="min-h-32 border-slate-200 focus:border-slate-400 rounded-2xl resize-y"
                  placeholder="Paste your website URL, describe your project, or ask any question..."
                  disabled={loading}
                />
              </div>

              {/* Status & Submit */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                <div className="min-h-[1.25rem]">
                  {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                  {success && <p className="text-sm text-emerald-600 font-medium">{success}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-8 rounded-2xl bg-slate-950 hover:bg-black text-white text-base font-medium shadow-lg shadow-slate-900/30 hover:shadow-xl transition-all active:scale-[0.985]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 size-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}