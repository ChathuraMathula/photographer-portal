import { type ChatMessage } from "@/types";
import { type RefObject } from "react";

type Props = {
  messages: ChatMessage[];
  myRole: string;
  photographerFirstName?: string;
  firstUnreadIndex: number;
  chatEndRef: RefObject<HTMLDivElement | null>;
};

export function ChatBoxMessageList({ messages, myRole, photographerFirstName, firstUnreadIndex, chatEndRef }: Props) {
  return (
    <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-zinc-50/50 dark:bg-zinc-950/20">
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-body-caption text-zinc-400 italic">No messages yet. Start the conversation.</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isMe = msg.sender === myRole;
          let displayName = isMe ? "You" : msg.senderName.split(" ")[0];
          if (!isMe && msg.sender === "PHOTOGRAPHER" && photographerFirstName) displayName = photographerFirstName;
          const isFirstUnread = index === firstUnreadIndex;

          return (
            <div key={msg.id} className="space-y-2">
              {isFirstUnread && (
                <div className="flex items-center my-4 animate-in fade-in duration-300">
                  <div className="flex-1 border-t border-red-300/60 dark:border-red-800/60"></div>
                  <span className="mx-3 text-body-caption text-red-500 font-bold uppercase tracking-wider">New Messages</span>
                  <div className="flex-1 border-t border-red-300/60 dark:border-red-800/60"></div>
                </div>
              )}
              <div className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto"}`}>
                <span className="text-body-caption text-zinc-400 px-1">{displayName}</span>
                <div className={`rounded-xl px-3 py-1.5 text-body-caption shadow-sm ${isMe ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "bg-white text-zinc-900 border dark:bg-zinc-900 dark:text-zinc-100"}`}>
                  <p className="break-all whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={chatEndRef as any} />
    </div>
  );
}
