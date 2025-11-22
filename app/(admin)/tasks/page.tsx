'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
   id: string;
   created_at: string;
   status: 'pending' | 'running' | 'completed' | 'failed';
   target: string;
   intent: string;
   query: string;
   user_profiles: {
      id: string;
      email: string;
   } | null;
}

const getTasks = async (page: number): Promise<{ tasks: Task[], count: number }> => {
   const response = await fetch(`/api/admin/tasks?page=${page}`);
   if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tasks.');
   }
   return response.json();
};

export default function AdminTasksPage() {
   const [page, setPage] = useState(1);

   const { data, isLoading, isError, error } = useQuery({
      queryKey: ['adminTasks', page],
      queryFn: () => getTasks(page),
      keepPreviousData: true,
   });

   const totalPages = data?.count ? Math.ceil(data.count / 20) : 0;

   const getStatusVariant = (status: Task['status']) => {
      switch (status) {
         case 'completed': return 'default';
         case 'failed': return 'destructive';
         case 'running': return 'secondary';
         case 'pending':
         default: return 'outline';
      }
   }

   return (
      <div>
         <h1 className="text-3xl font-bold mb-6">Task Monitoring</h1>
         <Card>
            <CardHeader>
               <CardTitle>All System Tasks</CardTitle>
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
                     <p>Error loading tasks: {error.message}</p>
                  </div>
               )}
               {data && (
                  <>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Target</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Query</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {data.tasks.map(task => (
                              <TableRow key={task.id}>
                                 <TableCell className="font-medium">{task.user_profiles?.email || 'N/A'}</TableCell>
                                 <TableCell>
                                    <Badge variant={getStatusVariant(task.status)}>
                                       {task.status}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="max-w-xs truncate">{task.target}</TableCell>
                                 <TableCell>{format(new Date(task.created_at), 'PPP p')}</TableCell>
                                 <TableCell className="max-w-xs truncate">{task.query}</TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                     <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                           disabled={page === 1}
                        >
                           <ChevronLeft className="h-4 w-4" />
                           <span className="ml-2">Previous</span>
                        </Button>
                        <span className="text-sm text-muted-foreground">
                           Page {page} of {totalPages > 0 ? totalPages : 1}
                        </span>
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setPage(prev => prev + 1)}
                           disabled={page >= totalPages}
                        >
                           <span className="mr-2">Next</span>
                           <ChevronRight className="h-4 w-4" />
                        </Button>
                     </div>
                  </>
               )}
            </CardContent>
         </Card>
      </div>
   );
}
