import { format } from 'date-fns';
import { getAdminCommercialOverview } from '@/lib/admin-commercial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

function formatDate(value: string) {
  return format(new Date(value), 'MMM d, yyyy');
}

export default async function AdminBookingsPage() {
  const overview = await getAdminCommercialOverview(50);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Review the latest booking request activity and details.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent booking requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.email ?? 'Unknown'}</TableCell>
                  <TableCell>{booking.domain ?? '—'}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell>{booking.provider}</TableCell>
                  <TableCell>{formatDate(booking.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
