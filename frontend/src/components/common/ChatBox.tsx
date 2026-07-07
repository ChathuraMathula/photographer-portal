import { type ChatMessage } from "@/types";
import { ChatBoxHeader } from "./chat-box/components/ChatBoxHeader";
import { ChatBoxMessageList } from "./chat-box/components/ChatBoxMessageList";
import { ChatBoxInput } from "./chat-box/components/ChatBoxInput";
import { useChatState } from "./chat-box/hooks/useChatState";

type Props = {
  messages: ChatMessage[];
  messageText: string;
  onMessageChange: (text: string) => void;
  onSend: (e: React.FormEvent) => void;
  disabled?: boolean;
  myRole: "PHOTOGRAPHER" | "CUSTOMER";
  title?: string;
  description?: string;
  reservationId?: string;
  photographerFirstName?: string;
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
  reservationId,
  photographerFirstName,
}: Props) {
  const { chatEndRef, firstUnreadIndex, unreadCount } = useChatState(
    messages,
    reservationId,
    myRole,
  );

  return (
    <div className="flex flex-col h-[500px] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
      <ChatBoxHeader
        unreadCount={unreadCount}
        title={title}
        description={description}
      />

      <ChatBoxMessageList
        messages={messages}
        myRole={myRole}
        photographerFirstName={photographerFirstName}
        firstUnreadIndex={firstUnreadIndex}
        chatEndRef={chatEndRef}
      />

      <ChatBoxInput
        messageText={messageText}
        onMessageChange={onMessageChange}
        onSend={onSend}
        disabled={disabled}
      />
    </div>
  );
}
