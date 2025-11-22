'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FeedbackMessage {
   id: string;
   created_at: string;
   user_id: string | null;
   user_email: string | null;
   feedback_type: 'bug' | 'feature' | 'contact';
   message: string;
   status: 'new' | 'seen' | 'archived';
   user_profiles: { email: string } | null; // Joined from API
}

const getFeedback = async (page: number, type: string, status: string): Promise<{ feedback: FeedbackMessage[], count: number }> => {
   const response = await fetch(`/api/admin/feedback?page=${page}&type=${type}&status=${status}`);
   if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch feedback.');
   }
   return response.json();
};

const updateFeedbackStatus = async (id: string, status: 'new' | 'seen' | 'archived') => {
   const response = await fetch('/api/admin/feedback', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
   });
   if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update feedback status.');
   }
   return response.json();
};

export default function AdminFeedbackPage() {
   const queryClient = useQueryClient();
   const [page, setPage] = useState(1);
   const [typeFilter, setTypeFilter] = useState('all');
   const [statusFilter, setStatusFilter] = useState('new'); // Default to 'new' feedback

   const { data, isLoading, isError, error } = useQuery({
      queryKey: ['adminFeedback', page, typeFilter, statusFilter],
      queryFn: () => getFeedback(page, typeFilter, statusFilter),
      keepPreviousData: true,
   });

   const totalPages = data?.count ? Math.ceil(data.count / 20) : 0;

   const updateStatusMutation = useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'new' | 'seen' | 'archived' }) => updateFeedbackStatus(id, status),
      onSuccess: () => {
         toast.success('Feedback status updated!');
         queryClient.invalidateQueries({ queryKey: ['adminFeedback'] });
      },
      onError: (err) => {
         toast.error(err.message);
      },
   });

   const getStatusVariant = (status: FeedbackMessage['status']) => {
      switch (status) {
         case 'new': return 'default';
         case 'seen': return 'secondary';
         case 'archived': return 'outline';
         default: return 'outline';
      }
   };

   const getTypeVariant = (type: FeedbackMessage['feedback_type']) => {
      switch (type) {
         case 'bug': return 'destructive';
         case 'feature': return 'default';
         case 'contact': return 'secondary';
         default: return 'outline';
      }
   };

   return (
      <div>
         <h1 className="text-3xl font-bold mb-6">Feedback Inbox</h1>
         <Card>
            <CardHeader>
               <CardTitle>User Submissions</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex space-x-4 mb-4">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                     <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="contact">General Question</SelectItem>
                     </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                     <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="seen">Seen</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               {isLoading && (
                  <div className="flex items-center justify-center p-8">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
               )}
               {isError && (
                  <div className="flex items-center justify-center text-red-500 p-8">
                     <AlertCircle className="mr-2 h-6 w-6" />
                     <p>Error loading feedback: {error.message}</p>
                  </div>
               )}
               {data && (
                  <>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Message</TableHead>
                              <TableHead>Submitted By</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {data.feedback.map(msg => (
                              <TableRow key={msg.id}>
                                 <TableCell>
                                    <Badge variant={getTypeVariant(msg.feedback_type)}>
                                       {msg.feedback_type}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="max-w-md truncate">{msg.message}</TableCell>
                                 <TableCell>{msg.user_profiles?.email || 'Anonymous'}</TableCell>
                                 <TableCell>
                                    <Badge variant={getStatusVariant(msg.status)}>
                                       {msg.status}
                                    </Badge>
                                 </TableCell>
                                 <TableCell>{format(new Date(msg.created_at), 'PPP p')}</TableCell>
                                 <TableCell>
                                    <Select
                                       value={msg.status}
                                       onValueChange={(newStatus: 'new' | 'seen' | 'archived') =>
                                          updateStatusMutation.mutate({ id: msg.id, status: newStatus })
                                       }
                                    >
                                       <SelectTrigger className="w-[100px] h-8">
                                          <SelectValue placeholder="Update" />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="new">New</SelectItem>
                                          <SelectItem value="seen">Seen</SelectItem>
                                          <SelectItem value="archived">Archived</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </TableCell>
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
