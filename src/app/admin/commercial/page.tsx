import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, CreditCard, CalendarDays, Mail, Users, Bot, Activity, UserCheck, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getSessionFromRequest } from '@/lib/auth';
import { getAdminCommercialOverview } from '@/lib/admin-commercial';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

function formatDate(value: string) {
  return format(new Date(value), 'MMM d, yyyy h:mm a');
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}

export default async function AdminCommercialPage() {
  const session = await getSessionFromRequest();
  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">You do not have access to the admin commercial dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const overview = await getAdminCommercialOverview(50);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="mb-5">
            <Link href="/">
              <ArrowLeft className="mr-1 size-4" />
              Back
            </Link>
          </Button>
          <Badge variant="outline" className="mb-4">Admin</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Commercial management</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Monitor leads, report email sends, strategy bookings, checkout activity, auth usage, and AI consumption from one place.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: 'Leads', value: overview.summary.leadCount, icon: Users },
            { label: 'Report Sends', value: overview.summary.reportSendCount, icon: Mail },
            { label: 'Bookings', value: overview.summary.bookingCount, icon: CalendarDays },
            { label: 'Checkouts', value: overview.summary.checkoutCount, icon: CreditCard },
            { label: 'Users', value: overview.summary.userCount, icon: UserCheck },
            { label: 'Contacts', value: overview.summary.contactCount, icon: Mail },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{item.value}</p>
                </div>
                <item.icon className="size-8 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Active Sessions', value: overview.summary.activeSessionCount, icon: Activity },
            { label: 'Logins Logged', value: overview.summary.loginCount, icon: UserCheck },
            { label: 'Signups Logged', value: overview.summary.signupCount, icon: Sparkles },
            { label: 'AI Calls', value: overview.summary.aiCallCount, icon: Bot },
            { label: 'AI Tokens', value: overview.summary.aiTokenTotal.toLocaleString(), icon: Bot },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{item.value}</p>
                </div>
                <item.icon className="size-8 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Authentication</p>
                  <div className="space-y-2 text-sm">
                    <p>Recent logins (24h): <span className="font-semibold">{overview.auth.recentLogins24h}</span></p>
                    <p>Recent signups (24h): <span className="font-semibold">{overview.auth.recentSignups24h}</span></p>
                    <p>Active sessions: <span className="font-semibold">{overview.summary.activeSessionCount}</span></p>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">AI Usage</p>
                  <div className="space-y-2 text-sm">
                    <p>Total calls: <span className="font-semibold">{overview.aiUsage.totalCalls}</span></p>
                    <p>Input tokens: <span className="font-semibold">{overview.aiUsage.totalInputTokens.toLocaleString()}</span></p>
                    <p>Output tokens: <span className="font-semibold">{overview.aiUsage.totalOutputTokens.toLocaleString()}</span></p>
                    <p>Total tokens: <span className="font-semibold">{overview.aiUsage.totalTokens.toLocaleString()}</span></p>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Commercial</p>
                  <div className="space-y-2 text-sm">
                    <p>Subscription intents: <span className="font-semibold">{overview.summary.subscriptionIntentCount}</span></p>
                    <p>Lead captures: <span className="font-semibold">{overview.summary.leadCount}</span></p>
                    <p>Report sends: <span className="font-semibold">{overview.summary.reportSendCount}</span></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Users</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.users.length === 0 ? (
                <EmptyState message="No users found." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Active Sessions</TableHead>
                      <TableHead>Audits</TableHead>
                      <TableHead>AI Calls</TableHead>
                      <TableHead>AI Tokens</TableHead>
                      <TableHead>Checkouts</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                        <TableCell>{user.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}</TableCell>
                        <TableCell>{user.activeSessionCount}</TableCell>
                        <TableCell>{user.auditCount}</TableCell>
                        <TableCell>{user.aiCallCount}</TableCell>
                        <TableCell>{user.aiTokenTotal.toLocaleString()}</TableCell>
                        <TableCell>{user.checkoutCount}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Calls</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.aiCalls.length === 0 ? (
                <EmptyState message="No AI fix calls have been logged yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Input</TableHead>
                      <TableHead>Output</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.aiCalls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.email ?? 'Guest'}</TableCell>
                        <TableCell>{call.provider ?? '—'}</TableCell>
                        <TableCell>{call.framework ?? '—'}</TableCell>
                        <TableCell className="max-w-[180px] truncate">{call.domain ?? '—'}</TableCell>
                        <TableCell className="max-w-[220px] truncate">{call.issueTitle ?? '—'}</TableCell>
                        <TableCell>{call.inputTokens.toLocaleString()}</TableCell>
                        <TableCell>{call.outputTokens.toLocaleString()}</TableCell>
                        <TableCell>{call.totalTokens.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(call.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.leads.length === 0 ? (
                <EmptyState message="No leads have been captured yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.email}</TableCell>
                        <TableCell>{lead.domain ?? '—'}</TableCell>
                        <TableCell><Badge variant="secondary">{lead.source}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{lead.status}</Badge></TableCell>
                        <TableCell>{lead.userEmail ?? 'Guest'}</TableCell>
                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.contacts.length === 0 ? (
                <EmptyState message="No contact messages have been submitted yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name ?? '—'}</TableCell>
                        <TableCell>{contact.email ?? contact.userEmail ?? '—'}</TableCell>
                        <TableCell>{contact.phone ?? '—'}</TableCell>
                        <TableCell className="max-w-[320px] truncate">{contact.message ?? '—'}</TableCell>
                        <TableCell><Badge variant="outline">{contact.status}</Badge></TableCell>
                        <TableCell>{formatDate(contact.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Sends</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.reportSends.length === 0 ? (
                <EmptyState message="No report delivery events have been logged yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Audit</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.reportSends.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.email ?? '—'}</TableCell>
                        <TableCell>
                          {event.auditId ? (
                            <Button asChild variant="link" size="sm" className="h-auto px-0">
                              <Link href={`/?audit=${event.auditId}`}>{event.auditId.slice(0, 8)}...</Link>
                            </Button>
                          ) : '—'}
                        </TableCell>
                        <TableCell>{event.provider ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={event.status === 'sent' ? 'secondary' : 'outline'}>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate">{event.skippedReason ?? 'Delivered'}</TableCell>
                        <TableCell>{formatDate(event.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.bookings.length === 0 ? (
                <EmptyState message="No strategy booking requests have been created yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Booking Link</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.email ?? booking.userEmail ?? 'Guest'}</TableCell>
                        <TableCell>{booking.domain ?? '—'}</TableCell>
                        <TableCell><Badge variant="outline">{booking.status}</Badge></TableCell>
                        <TableCell>{booking.provider}</TableCell>
                        <TableCell>
                          {booking.externalUrl ? (
                            <Button asChild variant="link" size="sm" className="h-auto px-0">
                              <Link href={booking.externalUrl} target="_blank">Open</Link>
                            </Button>
                          ) : '—'}
                        </TableCell>
                        <TableCell>{formatDate(booking.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Checkout Status</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.checkouts.length === 0 ? (
                <EmptyState message="No checkout sessions have been created yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Checkout Link</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.checkouts.map((checkout) => (
                      <TableRow key={checkout.id}>
                        <TableCell className="font-medium">{checkout.email ?? checkout.userEmail ?? 'Guest'}</TableCell>
                        <TableCell>{checkout.plan ?? '—'}</TableCell>
                        <TableCell><Badge variant="outline">{checkout.status}</Badge></TableCell>
                        <TableCell>{checkout.provider}</TableCell>
                        <TableCell className="max-w-[180px] truncate">{checkout.externalId ?? '—'}</TableCell>
                        <TableCell>
                          {checkout.externalUrl ? (
                            <Button asChild variant="link" size="sm" className="h-auto px-0">
                              <Link href={checkout.externalUrl} target="_blank">Open</Link>
                            </Button>
                          ) : '—'}
                        </TableCell>
                        <TableCell>{formatDate(checkout.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
