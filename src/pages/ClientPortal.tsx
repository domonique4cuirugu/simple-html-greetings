
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import FileList from "@/components/FileList";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { getMessagesForClient, sendMessage } from "@/services/messageService";
import { fileService, FileItem, getFileType } from "@/services/fileService";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ClientPortal: React.FC = () => {
  const [clientId, setClientId] = useState<string>("client-id-1"); // Placeholder - would come from auth
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages for the client
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['client-messages', clientId],
    queryFn: () => getMessagesForClient(clientId),
  });

  // Fetch files for the client
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['client-files', clientId],
    queryFn: async () => {
      const allFiles = await fileService.getAllFiles();
      return allFiles.filter(file => file.clientId === clientId);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      return sendMessage(clientId, content, false); // false = sent by client
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-messages', clientId] });
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

  // File upload handler
  const handleFileUpload = async (file: File) => {
    try {
      const uploadedFile = await fileService.uploadFile(file, clientId);
      
      if (uploadedFile) {
        queryClient.invalidateQueries({ queryKey: ['client-files', clientId] });
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      } else {
        throw new Error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  // Setup realtime subscription for messages
  useEffect(() => {
    const channel = supabase
      .channel('public:client_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'client_messages',
        filter: `client_id=eq.${clientId}`
      }, (payload) => {
        // Invalidate queries when message data changes
        queryClient.invalidateQueries({ queryKey: ['client-messages', clientId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, queryClient]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-slate-500 mt-1">
            Communicate and share files with your accountant
          </p>
        </header>

        <Card className="shadow-soft">
          <Tabs defaultValue="messages" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="bg-slate-100 p-0.5">
                <TabsTrigger 
                  value="messages" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm"
                >
                  Messages
                </TabsTrigger>
                <TabsTrigger 
                  value="files" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm"
                >
                  Files
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="messages" className="p-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/accountant-avatar.png" alt="Your Accountant" />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-medium">Your Accountant</h2>
                    </div>
                  </div>
                </div>

                <div className="h-[400px] overflow-y-auto p-4 bg-white">
                  {messagesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500">Loading messages...</p>
                    </div>
                  ) : (
                    <MessageList
                      messages={messages}
                      currentUserId={clientId}
                    />
                  )}
                </div>

                <div className="p-4 border-t bg-white">
                  <MessageInput 
                    onSendMessage={(content) => sendMessageMutation.mutate(content)} 
                    disabled={sendMessageMutation.isPending}
                    placeholder="Type your message..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Upload Files</h3>
                  <FileUpload 
                    onFileUpload={handleFileUpload} 
                    clientId={clientId}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    maxSize={10 * 1024 * 1024} // 10MB
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Your Files</h3>
                  {filesLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading files...</p>
                    </div>
                  ) : (
                    <FileList 
                      files={files} 
                      emptyMessage="You haven't shared any files yet." 
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ClientPortal;
