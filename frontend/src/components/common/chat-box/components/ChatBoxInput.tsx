import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

type Props = {
  messageText: string;
  onMessageChange: (text: string) => void;
  onSend: (e: React.FormEvent) => void;
  disabled?: boolean;
};

export function ChatBoxInput({
  messageText,
  onMessageChange,
  onSend,
  disabled,
}: Props) {
  return (
    <form
      onSubmit={onSend}
      className="p-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-1.5"
    >
      <Input
        placeholder="Type a message..."
        value={messageText}
        onChange={(e) => onMessageChange(e.target.value)}
        className="chat-input text-body-caption"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!messageText.trim() || disabled}
        className="chat-button flex items-center justify-center rounded-lg bg-[#0e2d5c] hover:bg-[#1a4175] text-white transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0e2d5c]"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
