import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Building, Clock, Edit, Trash, Upload, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import FileList, { FileItem } from "@/components/FileList";
import FileUpload from "@/components/FileUpload";
import type { Message } from "@/services/messageService";
import { fileService, getFileType } from "@/services/fileService";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string | null;
  tax_id?: string | null;
  notes?: string | null;
  client_since?: string | null;
  last_activity?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const ClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const currentUserId = "user-001"; // Replace with actual user ID

  useEffect(() => {
    if (!clientId) return;
    fetchClient();
    fetchMessages();
    fetchFiles();

    // Scroll to bottom on message update
    scrollToBottom();
  }, [clientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchClient = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        throw error;
      }

      setClient(data);
      setEditFormData(data);
    } catch (error) {
      console.error("Error fetching client:", error);
      toast({
        title: "Error",
        description: "Failed to load client details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      // Mocked messages - replace with actual data fetching
      const initialMessages: Message[] = [
        {
          id: "1",
          sender: { id: "user-001", name: "You", avatar: "/avatars/7.png" },
          timestamp: new Date(),
          content: "Hello! How can I assist you today?",
          read: true,
        },
        {
          id: "2",
          sender: { id: "client-001", name: client?.name || "Client", avatar: "/avatars/1.png" },
          timestamp: new Date(),
          content: "I have a question about my tax return.",
          read: true,
        },
      ];
      setMessages(initialMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('client_files')
        .select('*')
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedFiles = data.map(file => ({
        id: file.id,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploadedAt: new Date(file.uploaded_at),
        uploadedBy: file.uploaded_by,
        clientId: file.client_id,
        storagePath: file.storage_path
      }));

      setFiles(formattedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('clients')
        .update(editFormData)
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Client updated",
        description: `${client?.name} has been updated successfully.`,
      });
      setIsEditOpen(false);
      fetchClient();
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Client deleted",
        description: `${client?.name} has been deleted successfully.`,
      });
      setIsDeleteOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: String(messages.length + 1),
      sender: {
        id: currentUserId,
        name: "You",
        avatar: "/avatars/7.png",
      },
      timestamp: new Date(),
      content: newMessage,
      read: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      if (!clientId) {
        throw new Error("Client ID is missing.");
      }

      const uploadedFile = await fileService.uploadFile(file, clientId);

      if (uploadedFile) {
        setFiles([uploadedFile, ...files]);
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      } else {
        throw new Error("Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <p>Loading client details...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <p>Client not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Client
            </Button>
          </div>
        </header>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                <p className="text-slate-500">{client.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Contact Information</p>
                <div className="mt-2 space-y-1">
                  <p className="flex items-center text-slate-500">
                    <Phone className="h-4 w-4 mr-2" />
                    {client.phone}
                  </p>
                  <p className="flex items-center text-slate-500">
                    <Mail className="h-4 w-4 mr-2" />
                    {client.email}
                  </p>
                  {client.address && (
                    <p className="flex items-center text-slate-500">
                      <Building className="h-4 w-4 mr-2" />
                      {client.address}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Client Details</p>
                <div className="mt-2 space-y-1">
                  {client.client_since && (
                    <p className="flex items-center text-slate-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Client Since: {format(new Date(client.client_since), 'MMMM dd, yyyy')}
                    </p>
                  )}
                  {client.last_activity && (
                    <p className="flex items-center text-slate-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Last Activity: {formatDistanceToNow(new Date(client.last_activity), { addSuffix: true })}
                    </p>
                  )}
                  {client.tax_id && (
                    <p className="flex items-center text-slate-500">
                      Tax ID: {client.tax_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {client.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Notes</p>
                  <p className="mt-2 text-slate-500">{client.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="messages" className="mt-6">
          <TabsList className="bg-slate-100 p-0.5">
            <TabsTrigger value="messages" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm">Messages</TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm">Files</TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="mt-4">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <MessageList messages={messages} currentUserId={currentUserId} />
                <div ref={bottomRef} />
                <MessageInput
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onSend={handleSendMessage}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="files" className="mt-4">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Client Files</h3>
                  <FileUpload onFileUpload={handleFileUpload} />
                </div>
                <FileList files={files} emptyMessage="No files uploaded yet." />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Make changes to the client's information here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Client Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={editFormData.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="company" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Company
                </label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Acme Inc."
                  value={editFormData.company || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={editFormData.email || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(555) 123-4567"
                  value={editFormData.phone || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Address
                </label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St"
                  value={editFormData.address || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="tax_id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Tax ID
                </label>
                <Input
                  id="tax_id"
                  name="tax_id"
                  placeholder="12-3456789"
                  value={editFormData.tax_id || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes"
                  value={editFormData.notes || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDetail;
