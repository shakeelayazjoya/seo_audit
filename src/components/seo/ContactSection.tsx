'use client';

import { useState } from 'react';
import { Loader2, Mail, Phone, Send, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Contact us</CardTitle>
        <p className="text-sm text-slate-300">
          Need help with your audit, implementation, or a custom SEO plan? Send us a message.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="text-slate-200">Name</Label>
              <div className="relative">
                <User2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-400"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-slate-200">Email</Label>
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
                  className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-400"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="text-slate-200">Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="contact-phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError('');
                }}
                className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-400"
                placeholder="+1 555 555 5555"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message" className="text-slate-200">Message</Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError('');
              }}
              className="min-h-32 border-white/10 bg-white/5 text-white placeholder:text-slate-400"
              placeholder="Tell us how we can help."
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}

          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
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
