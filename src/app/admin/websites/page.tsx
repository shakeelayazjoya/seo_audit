import { format } from 'date-fns';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

function formatDate(value: Date | null) {
  if (!value) return '—';
  return format(new Date(value), 'MMM d, yyyy');
}

export default async function AdminWebsitesPage() {
  const websites = await db.audit.groupBy({
    by: ['domain'],
    _count: { id: true },
    _max: { createdAt: true },
    orderBy: { _count: { id: 'desc' } },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All websites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            See the most audited domains and websites that have been processed by the platform.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top audited domains</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Audit count</TableHead>
                <TableHead>Latest audited</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => (
                <TableRow key={website.domain}>
                  <TableCell className="font-medium">{website.domain}</TableCell>
                  <TableCell>{website._count.id}</TableCell>
                  <TableCell>{formatDate(website._max.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
