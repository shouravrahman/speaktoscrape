"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  Users,
  Terminal,
  MessageSquarePlus,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/tasks", icon: Terminal, label: "Task Monitoring" },
  { href: "/admin/feedback", icon: MessageSquarePlus, label: "Feedback" },
  { href: "/admin/dashboard/billing", icon: CreditCard, label: "Billing" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full md:h-screen bg-card text-card-foreground p-4 border-r md:border-b-0 border-b md:w-64">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
          <Bot className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold">Admin Panel</span>
      </div>
      <nav className="flex-1 space-y-2 md:space-y-2 flex md:flex-col flex-row md:overflow-visible overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center p-2 rounded-md hover:bg-muted whitespace-nowrap md:whitespace-normal",
              pathname === item.href && "bg-muted font-semibold"
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
