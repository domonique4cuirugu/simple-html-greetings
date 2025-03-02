
import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onAttachFile?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

// Simplified Textarea component since we don't have direct access to modify the UI components
const Textarea = ({ 
  value, 
  onChange, 
  placeholder,
  disabled,
  onKeyDown,
  className
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    onKeyDown={onKeyDown}
    className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[80px] ${className}`}
  />
);

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onAttachFile,
  placeholder = "Type a message...",
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      
      // Focus back on textarea after sending
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t pt-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            className="focus-visible:ring-1"
          />
        </div>
        <div className="flex flex-col space-y-2">
          {onAttachFile && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onAttachFile}
              disabled={disabled}
              className="h-10 w-10"
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </div>
  );
};

export default MessageInput;
