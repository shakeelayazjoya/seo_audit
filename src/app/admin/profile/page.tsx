import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromRequest } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminProfilePage() {
  const session = await getSessionFromRequest();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-base font-medium text-foreground">{session.user.name ?? 'Administrator'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-base font-medium text-foreground">{session.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="outline">{session.user.role}</Badge>
            </div>
            <div className="rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Admin actions</p>
              <p className="mt-2">
                Use this page to update your admin account or navigate back to the main admin dashboard.
              </p>
              <Link href="/admin" className="text-primary hover:underline">
                Return to admin dashboard
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
