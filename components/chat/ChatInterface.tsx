'use client';

import { useAppChat } from '@/lib/hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface Message {
   id: string;
   type: 'user' | 'assistant' | 'system';
   content: string;
   timestamp: Date;
   taskId?: string;
   metadata?: any;
}

interface ChatInterfaceProps {
   initialMessages?: Message[];
   chatId?: string | null;
   onNewChatCreated?: (newChatId: string) => void;
}

export function ChatInterface({ initialMessages = [], chatId = null, onNewChatCreated }: ChatInterfaceProps) {
   const {
      input,
      setInput,
      messages,
      isSending,
      handleSendMessage,
   } = useAppChat({ initialMessages, chatId, onNewChatCreated });

   return (
      <div className="flex flex-col h-full">
         <MessageList messages={messages} />
         <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            isSending={isSending}
         />
      </div>
   );
}