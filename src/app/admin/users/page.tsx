import { format } from 'date-fns';
import { getAdminCommercialOverview } from '@/lib/admin-commercial';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

function formatDate(value: string) {
  return format(new Date(value), 'MMM d, yyyy');
}

export default async function AdminUsersPage() {
  const overview = await getAdminCommercialOverview(50);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Review the most recent user accounts, active sessions, and audit status.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest registered users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Audits</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>AI tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{user.auditCount}</TableCell>
                  <TableCell>{user.activeSessionCount}</TableCell>
                  <TableCell>{user.aiTokenTotal.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
