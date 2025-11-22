"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  Eye,
  Download,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  content: string;
  metadata: {
    dataType: string;
    taskId: string;
    format?: string;
    source_url?: string;
  };
  similarity: number;
}

interface ScrapeTask {
  id: string;
  task_data: any; // Assuming task_data contains the original query/URL
  status: string;
  created_at: string;
}

interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  avg_duration: number | null;
  active_days: number;
  last_activity: string | null;
}

export function VectorSearchInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const [recentScrapes, setRecentScrapes] = useState<ScrapeTask[]>([]);
  const [loadingScrapes, setLoadingScrapes] = useState(true);
  const [errorScrapes, setErrorScrapes] = useState<string | null>(null);

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          setErrorStats(data.error || "Failed to fetch stats");
        }
      } catch (error: any) {
        setErrorStats(error.message || "Failed to fetch stats");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch Recent Scrapes
  useEffect(() => {
    const fetchRecentScrapes = async () => {
      try {
        const response = await fetch("/api/dashboard/recent-scrapes");
        const data = await response.json();
        if (data.success) {
          setRecentScrapes(data.recentScrapes);
        } else {
          setErrorScrapes(data.error || "Failed to fetch recent scrapes");
        }
      } catch (error: any) {
        setErrorScrapes(error.message || "Failed to fetch recent scrapes");
      } finally {
        setLoadingScrapes(false);
      }
    };
    fetchRecentScrapes();
  }, []);

  const handleVectorSearch = async (newPage = 1) => {
    if (!searchQuery.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("/api/search/vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, page: newPage }),
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults((prev) =>
          newPage === 1 ? data.results : [...prev, ...data.results]
        );
        setPage(newPage);
        setHasMore(data.results.length > 0);
        if (newPage === 1) {
          toast.success(`Found ${data.results.length} relevant results`);
        }
      } else {
        toast.error("Search failed: " + data.error);
      }
    } catch (error: any) {
      toast.error("Search failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (taskId: string, format: string = "json") => {
    try {
      const response = await fetch(
        `/api/scraping/download?taskId=${taskId}&format=${format}`
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scraping-result-${taskId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 lg:p-8">
      {/* Main Content: Search and Results */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all your scraped data..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleVectorSearch(1)}
          />
          <Button onClick={() => handleVectorSearch(1)} disabled={loading}>
            {loading && page === 1 ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}{" "}
            Search
          </Button>
        </div>

        <div className="space-y-4">
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm mb-2">{result.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">
                        {result.metadata.dataType}
                      </Badge>
                      {result.metadata.source_url && (
                        <a
                          href={result.metadata.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          <Globe className="w-3 h-3 inline-block mr-1" />
                          Source
                        </a>
                      )}
                      <span>|</span>
                      <span>
                        Similarity: {(result.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleDownload(
                        result.metadata.taskId,
                        result.metadata.format
                      )
                    }
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>Your search results will appear here.</p>
            </Card>
          )}
          {searchResults.length > 0 && hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={() => handleVectorSearch(page + 1)}
                disabled={loading}
              >
                {loading && page > 1 ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}{" "}
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Stats and Recent Activity */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingStats ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : errorStats ? (
              <p className="text-red-500 text-sm">Error: {errorStats}</p>
            ) : stats ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Tasks
                  </span>
                  <span className="font-semibold">{stats.total_tasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Completed Tasks
                  </span>
                  <span className="font-semibold">{stats.completed_tasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Failed Tasks
                  </span>
                  <span className="font-semibold">{stats.failed_tasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Last Activity
                  </span>
                  <span className="font-semibold">
                    {stats.last_activity
                      ? new Date(stats.last_activity).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No stats available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Scrapes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingScrapes ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : errorScrapes ? (
              <p className="text-red-500 text-sm">Error: {errorScrapes}</p>
            ) : recentScrapes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">URL</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentScrapes.map((scrape) => (
                      <TableRow key={scrape.id}>
                        <TableCell className="font-medium">
                          <div className="truncate max-w-[200px] md:max-w-[300px]">
                            <a
                              href={scrape.task_data?.target}
                              target="_blank"
                              className="hover:underline"
                            >
                              {scrape.task_data?.target || "N/A"}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon status={scrape.status} />
                            <span className="text-sm capitalize hidden sm:inline">
                              {scrape.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No recent scrapes found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
