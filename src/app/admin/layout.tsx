import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromRequest } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, CalendarDays, LayoutDashboard, PenLine, Newspaper, Settings } from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Console — SEO Audit',
};

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/commercial',
    icon: LayoutDashboard,
    description: 'Overview and quick admin metrics',
  },
  {
    name: 'Add Blog',
    href: '/admin/blogs/new',
    icon: PenLine,
    description: 'Create and publish blog content',
  },
  {
    name: 'All Blogs',
    href: '/admin/blogs',
    icon: Newspaper,
    description: 'Search, edit, and manage posts',
  },
  {
    name: 'All users',
    href: '/admin/users',
    icon: Users,
    description: 'View and manage registered accounts',
  },
  {
    name: 'All websites',
    href: '/admin/websites',
    icon: Globe,
    description: 'Review audited domains and website data',
  },
  {
    name: 'Booking requests',
    href: '/admin/bookings',
    icon: CalendarDays,
    description: 'Inspect incoming booking requests',
  },
  {
    name: 'Settings',
    href: '/admin/profile',
    icon: Settings,
    description: 'Admin profile and account details',
  },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromRequest();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lg:flex lg:min-h-screen h-screen overflow-hidden">
        <aside className="hidden w-80 flex-none flex-col border-r border-border bg-muted/80 px-5 py-6 lg:flex">
          <div className="space-y-2">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Admin Console</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">SEO Audit Admin</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage users, websites, bookings, and profile settings from one place.
            </p>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
              >
                <item.icon className="size-4 text-primary" />
                <div>
                  <p>{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Admin navigation</p>
            <p className="mt-2">Use the left menu to switch between dashboards and review admin data.</p>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Admin Dashboard</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Administrator workspace</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge>Admin</Badge>
                <Link href="/" className="text-sm font-medium text-primary hover:underline">
                  Go to site
                </Link>
                <Link href="/admin/profile" className="text-sm text-muted-foreground hover:text-foreground">
                  Profile
                </Link>
              </div>
            </div>
          </header>

          <div className="border-b border-border bg-muted/90 px-4 py-3 lg:hidden">
            <div className="flex flex-wrap gap-2 overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
