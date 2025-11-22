"use client";

import React, { useState, useEffect as ReactUseEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
   MessageSquare,
   Search,
   DollarSign,
   Settings,
   History as HistoryIcon,
   Pin,
   Edit,
   Link as LinkIcon,
   Menu,
   LogOut,
} from "lucide-react";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { Logo } from "@/components/Logo";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PRICING_TIERS } from "@/lib/constants/pricing";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/lib/store/userStore";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

interface ChatHistory {
   id: string;
   title: string;
   last_message: string;
   message_count: number;
   created_at: string;
   updated_at: string;
   is_pinned: boolean;
}

const fetchChatHistory = async (): Promise<ChatHistory[]> => {
   const response = await fetch("/api/chat/history");
   if (!response.ok) {
      const errorBody = await response
         .json()
         .catch(() => ({ error: "Failed to parse error response" }));
      throw new Error(
         errorBody.error ||
         `Failed to load chat history. Status: ${response.status}`
      );
   }
   const data = await response.json();
   if (data.success) {
      return data.chats.map((chat: any) => ({
         ...chat,
         created_at: new Date(chat.created_at),
         updated_at: new Date(chat.updated_at),
      }));
   }
   throw new Error(data.error || "Failed to load chat history.");
};

const renameChat = async ({
   chatId,
   newTitle,
}: {
   chatId: string;
   newTitle: string;
}) => {
   const response = await fetch("/api/chat/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, newTitle }),
   });
   const data = await response.json();
   if (!data.success) {
      throw new Error(data.error || "Failed to rename chat.");
   }
   return data;
};

const pinChat = async ({
   chatId,
   isPinned,
}: {
   chatId: string;
   isPinned: boolean;
}) => {
   const response = await fetch("/api/chat/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, isPinned }),
   });
   const data = await response.json();
   if (!data.success) {
      throw new Error(
         data.error || `Failed to ${isPinned ? "pin" : "unpin"} chat.`
      );
   }
   return data;
};

const startNewChatApi = async () => {
   const response = await fetch("/api/chat/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
   });
   const data = await response.json();
   if (!data.success) {
      throw new Error(data.error || "Failed to start new chat.");
   }
   return data;
};

const SidebarContent = () => {
   const [editingChatId, setEditingChatId] = useState<string | null>(null);
   const [newChatTitle, setNewChatTitle] = useState<string>("");
   const router = useRouter();
   const queryClient = useQueryClient();
   const { user, userProfile, subscription } = useUser();
   const supabase = createClient();

   // Fetch current month usage
   const { data: usageData } = useQuery({
      queryKey: ["usage", user?.id],
      queryFn: async () => {
         const response = await fetch("/api/user/usage");
         if (!response.ok) throw new Error("Failed to fetch usage");
         return response.json();
      },
      enabled: !!user,
   });

   const scrapingJobsUsed = usageData?.scrapingJobsUsed || 0;
   const currentPlanId = subscription?.current_plan_id || null;

   const {
      data: chatHistory = [],
      isLoading: isLoadingChatHistory,
      error: chatHistoryError,
   } = useQuery<ChatHistory[]>({
      queryKey: ["chatHistory"],
      queryFn: fetchChatHistory,
      enabled: !!user,
      select: (chats) =>
         chats.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return (
               new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
         }),
   });

   ReactUseEffect(() => {
      if (chatHistoryError) {
         toast.error(chatHistoryError.message || "Failed to load chat history.");
      }
   }, [chatHistoryError]);

   const renameChatMutation = useMutation({
      mutationFn: renameChat,
      onSuccess: () => {
         toast.success("Chat renamed successfully!");
         queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
         setEditingChatId(null);
         setNewChatTitle("");
      },
      onError: (error: any) => {
         toast.error(`Failed to rename chat: ${error.message}`);
      },
   });

   const handleRenameChat = (chatId: string) => {
      if (!newChatTitle.trim()) {
         toast.error("Chat title cannot be empty.");
         return;
      }
      renameChatMutation.mutate({ chatId, newTitle: newChatTitle });
   };

   const pinChatMutation = useMutation({
      mutationFn: pinChat,
      onSuccess: (_, variables) => {
         toast.success(variables.isPinned ? "Chat pinned!" : "Chat unpinned!");
         queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
      },
      onError: (error: any) => {
         toast.error(`Failed to pin/unpin chat: ${error.message}`);
      },
   });

   const handlePinChat = (chatId: string, isPinned: boolean) => {
      pinChatMutation.mutate({ chatId, isPinned });
   };

   const startNewChatMutation = useMutation({
      mutationFn: startNewChatApi,
      onSuccess: (data) => {
         router.push(`/chat/${data.chatId}`);
         queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
      },
      onError: (error: any) => {
         toast.error(`Failed to start new chat: ${error.message}`);
      },
   });

   const startNewChat = () => {
      startNewChatMutation.mutate();
   };

   const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
      toast.success("Logged out successfully");
   };

   return (
      <div className="flex flex-col h-full">
         <div className="flex items-center justify-between h-14 border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
               <Logo />
               <span className="">SpeakToScrape</span>
            </Link>
         </div>
         <ScrollArea className="flex-1 p-4">
            <Button
               onClick={startNewChat}
               className="w-full mb-4"
               disabled={startNewChatMutation.isPending}
            >
               <MessageSquare className="mr-2 h-4 w-4" /> New Chat
            </Button>

            <div className="mb-4">
               <h3 className="text-sm font-semibold mb-2">History</h3>
               {isLoadingChatHistory ? (
                  <p className="text-sm text-muted-foreground">
                     Loading chat history...
                  </p>
               ) : chatHistory.length > 0 ? (
                  <ul className="space-y-2">
                     {chatHistory.map((chat) => (
                        <li
                           key={chat.id}
                           className="flex items-center justify-between group"
                        >
                           {editingChatId === chat.id ? (
                              <Input
                                 value={newChatTitle}
                                 onChange={(e) => setNewChatTitle(e.target.value)}
                                 onBlur={() => handleRenameChat(chat.id)}
                                 onKeyPress={(e) =>
                                    e.key === "Enter" && handleRenameChat(chat.id)
                                 }
                                 className="flex-1 mr-2 h-8"
                                 autoFocus
                              />
                           ) : (
                              <Link
                                 href={`/chat/${chat.id}`}
                                 className="flex-1 truncate p-2 rounded-md hover:bg-muted"
                              >
                                 {chat.title}
                              </Link>
                           )}
                           <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-7 w-7"
                                 onClick={() => {
                                    setEditingChatId(chat.id);
                                    setNewChatTitle(chat.title);
                                 }}
                              >
                                 <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-7 w-7"
                                 onClick={() => handlePinChat(chat.id, !chat.is_pinned)}
                              >
                                 <Pin
                                    className={`h-4 w-4 ${chat.is_pinned ? "text-primary" : ""
                                       }`}
                                 />
                              </Button>
                           </div>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <p className="text-sm text-muted-foreground">
                     No chat history yet.
                  </p>
               )}
            </div>

            <nav className="space-y-1">
               <Link
                  href="/scraping"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
               >
                  <Search className="h-4 w-4" /> Scraping
               </Link>
               <Link
                  href="/search"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
               >
                  <Search className="h-4 w-4" /> Search
               </Link>
               <Link
                  href="/pricing"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
               >
                  <DollarSign className="h-4 w-4" /> Pricing
               </Link>
               <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
               >
                  <Settings className="h-4 w-4" /> Settings
               </Link>
               <Link
                  href="/settings/connected-accounts"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
               >
                  <LinkIcon className="h-4 w-4" /> Connected Accounts
               </Link>
            </nav>
         </ScrollArea>

         <div className="mt-auto p-4 space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
               <div className="text-center">
                  <p className="text-sm text-muted-foreground">Scraping Jobs Used</p>
                  <p className="text-2xl font-bold">
                     {scrapingJobsUsed !== null ? scrapingJobsUsed : "--"} /
                     {currentPlanId
                        ? PRICING_TIERS.find((tier) => tier.id === currentPlanId)
                           ?.maxScrapingJobs || "Unlimited"
                        : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                     Current Plan:{" "}
                     {currentPlanId
                        ? currentPlanId.charAt(0).toUpperCase() + currentPlanId.slice(1)
                        : "Loading..."}
                  </p>
               </div>
               <Link href="/pricing" className="w-full mt-4">
                  <Button className="w-full">Manage Subscription</Button>
               </Link>
            </div>

            <div className="flex items-center justify-between p-2 border-t">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                           <AvatarImage
                              src={user?.user_metadata?.avatar_url}
                              alt={user?.email || "User"}
                           />
                           <AvatarFallback>
                              {user?.email?.[0].toUpperCase() || "U"}
                           </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[150px]">{user?.email}</span>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                     <DropdownMenuLabel>My Account</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link href="/settings">Settings</Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem>Support</DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
               <ThemeToggle />
            </div>
         </div>
      </div>
   );
};

export function Sidebar() {
   const [isSheetOpen, setIsSheetOpen] = useState(false);

   return (
      <>
         {/* Mobile Sidebar (Sheet) */}
         <div className="md:hidden fixed top-4 left-4 z-50">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
               <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                     <Menu className="h-5 w-5" />
                     <span className="sr-only">Toggle navigation menu</span>
                  </Button>
               </SheetTrigger>
               <SheetContent
                  side="left"
                  className="flex flex-col p-0 w-full max-w-sm"
               >
                  <SidebarContent />
               </SheetContent>
            </Sheet>
         </div>

         {/* Desktop Sidebar */}
         <div className="hidden md:block fixed left-0 top-0 h-full w-[280px] border-r bg-muted/40">
            <SidebarContent />
         </div>
      </>
   );
}
