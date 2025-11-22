'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function AdminBilling() {
  const [billingEvents, setBillingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBillingEvents() {
      try {
        const response = await fetch('/api/admin/billing');
        if (response.ok) {
          const data = await response.json();
          setBillingEvents(data);
        }
      } catch (error) {
        console.error('Error fetching billing events:', error);
      }
      setLoading(false);
    }

    fetchBillingEvents();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Events</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Badge>{event.event_name}</Badge>
                  </TableCell>
                  <TableCell>{event.user_id}</TableCell>
                  <TableCell>{new Date(event.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
