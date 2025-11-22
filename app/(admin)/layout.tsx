"use client";

import { useEffect } from "react";
import { useUser } from "@/lib/store/userStore";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || userProfile?.role !== "admin") {
        router.push("/404"); // Or redirect to home, login, etc.
      }
    }
  }, [user, userProfile, isLoading, router]);

  if (isLoading || !user || userProfile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="md:hidden mb-4">
          <AdminSidebar />
        </div>
        {children}
      </main>
    </div>
  );
}
