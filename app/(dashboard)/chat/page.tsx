'use client';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bot, Sparkles, MessageSquare, Activity } from 'lucide-react';

interface Message {
   id: string;
   type: 'user' | 'assistant' | 'system';
   content: string;
   timestamp: Date;
   taskId?: string;
   metadata?: any;
}

export default function ChatPage() {
   const params = useParams();
   const router = useRouter();
   const chatId = params.chatId as string | undefined;

   const [initialMessages, setInitialMessages] = useState<Message[]>([]);
   const [loadingMessages, setLoadingMessages] = useState(true);

   useEffect(() => {
      const fetchMessages = async () => {
         if (chatId) {
            setLoadingMessages(true);
            try {
               const response = await fetch(`/api/chat/${chatId}/messages`);
               const data = await response.json();
               if (data.success) {
                  setInitialMessages(data.messages.map((msg: any) => ({
                     ...msg,
                     timestamp: new Date(msg.created_at),
                  })));
               } else {
                  console.error('Error fetching chat messages:', data.error);
                  setInitialMessages([]);
               }
            } catch (error) {
               console.error('Error fetching chat messages:', error);
               setInitialMessages([]);
            } finally {
               setLoadingMessages(false);
            }
         } else {
            setInitialMessages([]);
            setLoadingMessages(false);
         }
      };

      fetchMessages();
   }, [chatId]);

   const handleNewChatCreated = (newChatId: string) => {
      router.replace(`/chat/${newChatId}`);
   };

   return (
      <div className="flex flex-col h-full">
         {/* Enhanced Header */}
         <header className="shrink-0 border-b border-border/40 bg-card/30 backdrop-blur-xl supports-[backdrop-filter]:bg-card/20 rounded-lg mb-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex items-center justify-between h-16">
                  {/* Left side - Brand */}
                  <div className="flex items-center gap-4">
                     <div className="relative">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 shadow-sm">
                           <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                     </div>

                     <div className="hidden sm:block">
                        <h1 className="text-lg font-semibold text-foreground">Agentic Scraper</h1>
                        <p className="text-sm text-muted-foreground">AI-Powered Web Intelligence</p>
                     </div>
                  </div>

                  {/* Right side - Session Info */}
                  {chatId && (
                     <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                           <Activity className="w-4 h-4 text-green-500" />
                           <span className="text-sm font-medium text-foreground">Live Session</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                           <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                           <span className="text-xs font-mono text-primary">#{chatId.slice(-8)}</span>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </header>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col min-h-0">
            {loadingMessages ? (
               <div className="flex-1 flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-6 text-center max-w-md">
                     {/* Enhanced Loading Animation */}
                     <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center shadow-lg">
                           <Bot className="w-10 h-10 text-primary" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-spin" style={{
                           background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary)/0.3), transparent)'
                        }} />
                     </div>

                     <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-foreground">Loading Conversation</h3>
                        <p className="text-muted-foreground">Retrieving your chat history and preparing the interface...</p>
                     </div>

                     {/* Refined Loading Indicators */}
                     <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                           <div
                              key={i}
                              className="w-2 h-2 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: `${i * 200}ms` }}
                           />
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col min-h-0">
                  {/* Chat Container with Professional Layout */}
                  <div className="flex-1 container mx-auto px-0 sm:px-0 lg:px-0 py-0 min-h-0">
                     <div className="h-full max-w-4xl mx-auto">
                        <div className="h-full rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden">
                           <ChatInterface
                              initialMessages={initialMessages}
                              chatId={chatId || null}
                              onNewChatCreated={handleNewChatCreated}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}