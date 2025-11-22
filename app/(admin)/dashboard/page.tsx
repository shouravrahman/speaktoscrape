'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

// Fetcher function for admin stats
const getAdminStats = async () => {
   const response = await fetch('/api/admin/stats');
   if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch admin statistics.');
   }
   return response.json();
};

export default function AdminDashboardPage() {
   const { data, isLoading, isError, error } = useQuery({
      queryKey: ['adminStats'],
      queryFn: getAdminStats,
   });

   const stats = [
      { title: 'Total Users', value: data?.totalUsers, key: 'totalUsers' },
      { title: 'Total Scraping Jobs', value: data?.totalJobs, key: 'totalJobs' },
      { title: 'Active Subscriptions', value: data?.activeSubscriptions, key: 'activeSubscriptions' },
      { title: 'Failed Jobs (24h)', value: data?.failedJobs24h, key: 'failedJobs24h' },
   ];

   if (isError) {
      return (
         <div className="flex items-center justify-center text-red-500">
            <AlertCircle className="mr-2 h-6 w-6" />
            <p>Error loading dashboard: {error.message}</p>
         </div>
      );
   }

   return (
      <div>
         <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(stat => (
               <Card key={stat.key}>
                  <CardHeader>
                     <CardTitle>{stat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                     ) : (
                        <p className="text-4xl font-bold">{stat.value}</p>
                     )}
                     <p className="text-sm text-muted-foreground mt-1">{isLoading ? 'Loading...' : ' '} </p>
                  </CardContent>
               </Card>
            ))}
         </div>
         {/* More dashboard components will go here */}
      </div>
   );
}
