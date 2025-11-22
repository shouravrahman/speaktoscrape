"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   Download,
   Filter,
   Calendar,
   Eye,
   Loader2,
   CheckCircle,
   XCircle,
   Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
   Pagination,
   PaginationContent,
   PaginationItem,
   PaginationPrevious,
   PaginationLink,
   PaginationNext,
} from "@/components/ui/pagination";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ScrapingTask {
   id: string;
   task_data: {
      target?: string;
      url?: string; // Assuming firecrawl tasks might have a 'url' field
      // Add other relevant fields from task_data if needed for display
      [key: string]: any; // Allow for flexible task_data structure
   };
   status: "pending" | "running" | "completed" | "failed";
   created_at: string;
   completed_at: string | null;
   error_message: string | null;
}

export function ScrapingHistoryTable() {
   const [tasks, setTasks] = useState<ScrapingTask[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [limit, setLimit] = useState(10); // Items per page
   const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all', 'pending', 'running', 'completed', 'failed'

   const fetchTasks = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const statusParam =
            filterStatus !== "all" ? `&status=${filterStatus}` : "";
         const response = await fetch(
            `/api/dashboard/scraping-history?page=${currentPage}&limit=${limit}${statusParam}`,
         );
         const data = await response.json();

         if (data.success) {
            setTasks(data.tasks);
            setTotalPages(Math.ceil(data.totalCount / limit));
         } else {
            setError(data.error || "Failed to fetch tasks");
         }
      } catch (err: any) {
         setError(err.message || "Failed to fetch tasks");
      } finally {
         setLoading(false);
      }
   }, [currentPage, limit, filterStatus]);

   useEffect(() => {
      fetchTasks();
   }, [fetchTasks]);

   const StatusIcon = ({ status }: { status: ScrapingTask["status"] }) => {
      switch (status) {
         case "completed":
            return <CheckCircle className="w-4 h-4 text-green-500" />;
         case "failed":
            return <XCircle className="w-4 h-4 text-red-500" />;
         case "running":
            return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
         case "pending":
            return <Clock className="w-4 h-4 text-gray-500" />;
         default:
            return null;
      }
   };

   const handlePageChange = (page: number) => {
      setCurrentPage(page);
   };

   const handleLimitChange = (value: string) => {
      setLimit(Number(value));
      setCurrentPage(1); // Reset to first page when limit changes
   };

   const handleFilterStatusChange = (value: string) => {
      setFilterStatus(value);
      setCurrentPage(1); // Reset to first page when filter changes
   };

   // Placeholder for view details functionality
   const handleViewDetails = (task: ScrapingTask) => {
      toast.info(`Viewing details for task ID: ${task.id}`, {
         description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
               <code className="text-white text-xs">
                  {JSON.stringify(task.task_data, null, 2)}
               </code>
               {task.error_message && (
                  <code className="text-red-400 text-xs mt-2 block">
                     Error: {task.error_message}
                  </code>
               )}
            </pre>
         ),
         duration: 5000,
      });
   };

   return (
      <div className="space-y-4 p-4">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Scraping History</h2>
            <div className="flex gap-2">
               <Select onValueChange={handleFilterStatusChange} value={filterStatus}>
                  <SelectTrigger className="w-[180px]">
                     <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Statuses</SelectItem>
                     <SelectItem value="pending">Pending</SelectItem>
                     <SelectItem value="running">Running</SelectItem>
                     <SelectItem value="completed">Completed</SelectItem>
                     <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
               </Select>
               {/* Placeholder for Date Range filter */}
               <Button size="sm" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
               </Button>
            </div>
         </div>

         <Card>
            {loading ? (
               <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
               </div>
            ) : error ? (
               <div className="p-4 text-red-500">Error: {error}</div>
            ) : tasks.length > 0 ? (
               <div className="overflow-x-auto">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="min-w-[80px]">ID</TableHead>
                           <TableHead className="min-w-[200px]">URL</TableHead>
                           <TableHead className="min-w-[100px]">Status</TableHead>
                           <TableHead className="min-w-[120px] hidden sm:table-cell">
                              Created At
                           </TableHead>
                           <TableHead className="min-w-[120px] hidden md:table-cell">
                              Completed At
                           </TableHead>
                           <TableHead className="min-w-[80px]">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {tasks.map((task) => (
                           <TableRow key={task.id}>
                              <TableCell className="font-medium text-xs">
                                 {task.id.substring(0, 8)}...
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                 <a
                                    href={task.task_data?.url || task.task_data?.target}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                 >
                                    {task.task_data?.url || task.task_data?.target || "N/A"}
                                 </a>
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center gap-2">
                                    <StatusIcon status={task.status} />
                                    <Badge variant="outline" className="capitalize">
                                       {task.status.replace(/_/g, " ")}
                                    </Badge>
                                 </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                 {format(new Date(task.created_at), "MMM d, HH:mm")}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                 {task.completed_at
                                    ? format(new Date(task.completed_at), "MMM d, HH:mm")
                                    : "N/A"}
                              </TableCell>
                              <TableCell>
                                 <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewDetails(task)}
                                 >
                                    <Eye className="w-4 h-4" />
                                 </Button>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            ) : (
               <div className="p-4 text-muted-foreground text-center">
                  No scraping tasks found.
               </div>
            )}
         </Card>

         {totalPages > 1 && (
            <Pagination>
               <PaginationContent>
                  <PaginationItem>
                     <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                     />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                     <PaginationItem key={i}>
                        <PaginationLink
                           onClick={() => handlePageChange(i + 1)}
                           isActive={currentPage === i + 1}
                        >
                           {i + 1}
                        </PaginationLink>
                     </PaginationItem>
                  ))}
                  <PaginationItem>
                     <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                     />
                  </PaginationItem>
               </PaginationContent>
            </Pagination>
         )}

         <div className="flex justify-end items-center gap-2 text-sm text-muted-foreground">
            <span>Items per page:</span>
            <Select onValueChange={handleLimitChange} value={String(limit)}>
               <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={limit} />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
               </SelectContent>
            </Select>
         </div>
      </div>
   );
}
