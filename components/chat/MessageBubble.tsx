import { format } from "date-fns";
import { Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DataTable } from "./DataTable";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  taskId?: string;
  metadata?: any;
}

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const router = useRouter();

  const renderContent = () => {
    const tableRegex = /```json\n(\[.*?\])```/s;
    const match = message.content.match(tableRegex);

    if (match && match[1]) {
      try {
        const data = JSON.parse(match[1]);
        return <DataTable data={data} />;
      } catch (error) {
        console.error("Failed to parse table data:", error);
        return (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        );
      }
    } else {
      return (
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      );
    }
  };

  return (
    <div
      className={`flex gap-2 sm:gap-4 ${
        message.type === "user" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex-1 max-w-[90%] sm:max-w-[85%] ${
          message.type === "user" ? "flex justify-end" : "flex justify-start"
        }`}
      >
        <div
          className={`px-3 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md ${
            message.type === "user"
              ? "bg-primary text-primary-foreground border-primary/20 rounded-br-md"
              : message.type === "system"
              ? "bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800/30"
              : "bg-card border-border/50 rounded-bl-md"
          }`}
        >
          {renderContent()}

          {message.metadata?.requiresAuth && (
            <div className="mt-4 pt-3 border-t border-current/20">
              <Button
                onClick={() => {
                  const token = encodeURIComponent(
                    message.metadata.originalQuery
                  );
                  router.push(
                    `/settings/connected-accounts?resume_task_token=${token}`
                  );
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Connect {message.metadata.domain} Account
              </Button>
            </div>
          )}

          <div
            className={`flex items-center justify-between mt-3 pt-2 border-t ${
              message.type === "user"
                ? "border-primary-foreground/20 text-primary-foreground/70"
                : "border-current/10 text-muted-foreground"
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3" />
              <span>{format(message.timestamp, "HH:mm")}</span>
              {isLatest && message.type === "assistant" && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                  Latest
                </span>
              )}
            </div>
            {message.taskId && (
              <div className="flex items-center gap-1 text-xs font-mono opacity-60">
                <FileText className="w-3 h-3" />
                <span>#{message.taskId.slice(-8)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
