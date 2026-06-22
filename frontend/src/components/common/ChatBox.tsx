import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import { type ChatMessage } from "@/types";

type Props = {
  messages: ChatMessage[];
  messageText: string;
  onMessageChange: (text: string) => void;
  onSend: (e: React.FormEvent) => void;
  disabled?: boolean;
  /** Which side is "me" — determines bubble alignment */
  myRole: "PHOTOGRAPHER" | "CUSTOMER";
  title?: string;
  description?: string;
};

export function ChatBox({
  messages,
  messageText,
  onMessageChange,
  onSend,
  disabled = false,
  myRole,
  title = "Live Chat",
  description = "Negotiate event details directly",
}: Props) {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col h-[500px] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="pb-3 px-4 pt-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" />
          {title}
        </h3>
        <p className="text-xs text-zinc-550 mt-0.5">{description}</p>
      </div>

      {/* Message list */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-zinc-50/50 dark:bg-zinc-950/20">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-zinc-400 italic">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === myRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  isMe ? "ml-auto items-end" : "mr-auto"
                }`}
              >
                <span className="text-[9px] text-zinc-400 px-1">
                  {msg.senderName}
                </span>
                <div
                  className={`rounded-xl px-3 py-1.5 text-xs shadow-sm ${
                    isMe
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                      : "bg-white text-zinc-900 border dark:bg-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  <p className="break-all whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={onSend}
        className="p-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-1.5"
      >
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => onMessageChange(e.target.value)}
          className="h-9 text-xs"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!messageText.trim() || disabled}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#0e2d5c] hover:bg-[#1a4175] text-white transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0e2d5c]"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
