import React, { useState, useEffect } from "react";
import { Search, User, CheckCheck, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { getConversations, getMessagesForClient, sendMessage, Conversation, Message } from "@/services/messageService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations
  });

  // Fetch messages for active conversation
  const { data: activeMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => activeConversationId ? getMessagesForClient(activeConversationId) : Promise.resolve([]),
    enabled: !!activeConversationId
  });

  // Set first conversation as active if none selected and data is loaded
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].clientId);
    }
  }, [conversations, activeConversationId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      if (!activeConversationId) return Promise.resolve(false);
      return sendMessage(activeConversationId, content, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(
    (conversation) => conversation.clientId === activeConversationId
  );

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

    // Setup realtime subscription for messages
    useEffect(() => {
      const channel = supabase
        .channel('public:client_messages')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'client_messages'
        }, (payload) => {
          // Invalidate queries when message data changes
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        })
        .subscribe();
  
      return () => {
        supabase.removeChannel(channel);
      };
    }, [queryClient]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-slate-500 mt-1">
            Communicate with your clients securely
          </p>
        </header>

        <div className="bg-white rounded-lg border overflow-hidden shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="divide-y max-h-[600px] overflow-y-auto">
                {conversationsLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-slate-500">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.clientId}
                      className={`p-4 cursor-pointer transition-colors ${
                        activeConversationId === conversation.clientId
                          ? "bg-slate-50"
                          : "hover:bg-slate-50"
                      }`}
                      onClick={() => setActiveConversationId(conversation.clientId)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.clientAvatar} alt={conversation.clientName} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">
                              {conversation.clientName}
                            </h3>
                            {conversation.lastMessageTime && (
                              <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <div className="flex items-start mt-1">
                              <p className="text-sm text-slate-500 truncate flex-1">
                                {conversation.lastMessage}
                              </p>
                              {conversation.unreadCount > 0 ? (
                                <span className="ml-2 flex-shrink-0 h-5 w-5 bg-black text-white rounded-full flex items-center justify-center text-xs">
                                  {conversation.unreadCount}
                                </span>
                              ) : (
                                <span className="ml-2 text-slate-400">
                                  <CheckCheck className="h-4 w-4" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-slate-500">No conversations found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 flex flex-col h-[600px]">
              {activeConversation ? (
                <>
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activeConversation.clientAvatar} alt={activeConversation.clientName} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-medium">{activeConversation.clientName}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {messagesLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-slate-500">Loading messages...</p>
                      </div>
                    ) : (
                      <MessageList
                        messages={activeMessages}
                        currentUserId="accountant"
                      />
                    )}
                  </div>

                  <div className="p-4 border-t mt-auto">
                    <MessageInput 
                      onSendMessage={handleSendMessage} 
                      disabled={sendMessageMutation.isPending}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="font-medium text-lg">No conversation selected</h3>
                  <p className="text-slate-500 mt-1">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
