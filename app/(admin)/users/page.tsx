'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface User {
   id: string;
   email: string;
   created_at: string;
   role: string;
   subscription_status: string;
   subscription_tier: string;
}

// Fetcher function for users
const getUsers = async (): Promise<{ users: User[] }> => {
   const response = await fetch('/api/admin/users');
   if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users.');
   }
   return response.json();
};

export default function AdminUsersPage() {
   const { data, isLoading, isError, error } = useQuery({
      queryKey: ['adminUsers'],
      queryFn: getUsers,
   });

   return (
      <div>
         <h1 className="text-3xl font-bold mb-6">User Management</h1>
         <Card>
            <CardHeader>
               <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
               {isLoading && (
                  <div className="flex items-center justify-center p-8">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
               )}
               {isError && (
                  <div className="flex items-center justify-center text-red-500 p-8">
                     <AlertCircle className="mr-2 h-6 w-6" />
                     <p>Error loading users: {error.message}</p>
                  </div>
               )}
               {data && (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Email</TableHead>
                           <TableHead>Role</TableHead>
                           <TableHead>Subscription</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>User Since</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data.users.map(user => (
                           <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>
                                 <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                 </Badge>
                              </TableCell>
                              <TableCell>{user.subscription_tier}</TableCell>
                              <TableCell>
                                 <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                                    {user.subscription_status}
                                 </Badge>
                              </TableCell>
                              <TableCell>{format(new Date(user.created_at), 'PPP')}</TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               )}
            </CardContent>
         </Card>
      </div>
   );
}
