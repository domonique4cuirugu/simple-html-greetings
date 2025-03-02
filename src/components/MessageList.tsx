
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { User, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/services/messageService";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  return (
    <div className="space-y-4 py-4">
      {messages.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-500">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.sender.id === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <div className="flex space-x-2 max-w-[75%]">
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="space-y-1">
                  <div
                    className={`rounded-lg px-4 py-2 text-sm ${
                      isOwnMessage
                        ? "bg-black text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {message.content}
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </span>
                    
                    {isOwnMessage && (
                      <span className="text-xs text-slate-500">
                        {message.read ? (
                          <CheckCheck className="h-3.5 w-3.5" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;
