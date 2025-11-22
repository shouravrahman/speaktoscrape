import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
}

export function ChatInput({
  input,
  setInput,
  handleSendMessage,
  isSending,
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="shrink-0 border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="p-4 max-w-4xl mx-auto">
        <div className="relative">
          <div className="relative flex items-end gap-3 p-2 bg-background border border-border/50 rounded-2xl shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all duration-200">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe what you'd like to scrape... (e.g., 'Get all product reviews from Amazon for iPhone 15')"
                className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent p-3 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
                disabled={isSending}
                rows={1}
              />
            </div>

            <div className="flex items-end gap-1 pb-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsRecording(!isRecording)}
                className={`h-9 w-9 p-0 rounded-xl transition-all duration-200 ${
                  isRecording
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "hover:bg-muted"
                }`}
                disabled={isSending}
              >
                <Mic
                  className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`}
                />
              </Button>

              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={isSending || !input.trim()}
                className="h-9 w-9 p-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">
              Quick Start:
            </span>
            <div className="h-px flex-1 bg-border/30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              "Scrape Hacker News front page as JSON",
              "Get Amazon product reviews for 'wireless earbuds'",
              "Extract job listings from Indeed with salaries",
              "Monitor competitor pricing daily",
              "Scrape documentation and make it searchable",
              "Get trending topics from social media",
            ].map((suggestion, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => setInput(suggestion)}
                className="justify-start text-left text-xs h-auto py-2 px-3 rounded-lg border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                disabled={isSending}
              >
                <span className="truncate">{suggestion}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>AI Agent Ready</span>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Listening...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Press Enter to send • Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
