'use client';

import { useEffect, useState, use, Suspense } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { toast } from 'sonner';

interface Message {
   id: string;
   type: 'user' | 'assistant' | 'system';
   content: string;
   timestamp: Date;
   taskId?: string;
   metadata?: any;
}

export default function ChatPage(props: { params: Promise<{ id: string }> }) {
   const params = use(props.params);
   const { id: chatId } = params;
   const [messages, setMessages] = useState<Message[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const loadChatMessages = async () => {
         setLoading(true);
         try {
            const response = await fetch(`/api/chat/${chatId}/messages`);
            const data = await response.json();
            if (data.success) {
               setMessages(data.messages.map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.created_at),
               })));
            } else {
               toast.error('Failed to load chat messages.');
               setMessages([]); // Clear messages on failure
            }
         } catch (error) {
            console.error('Error loading chat messages:', error);
            toast.error('An error occurred while loading chat messages.');
            setMessages([]); // Clear messages on error
         } finally {
            setLoading(false);
         }
      };

      if (chatId) {
         loadChatMessages();
      }
   }, [chatId]);

   if (loading) {
      return (
         <div className="flex-1 flex flex-col bg-background text-foreground items-center justify-center">
            <p>Loading chat history...</p>
         </div>
      );
   }

   return (
      <div className="flex flex-col h-full">
         <Suspense fallback={<div>Loading...</div>}>
            <ChatInterface initialMessages={messages} chatId={chatId} />
         </Suspense>
      </div>
   );
}