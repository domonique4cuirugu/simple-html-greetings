
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Message = {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isAccountant: boolean;
  };
  read: boolean;
};

export type Conversation = {
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  messages: Message[];
};

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name');

    if (clientsError) throw clientsError;
    if (!clients) return [];

    // Get all messages for all clients
    const { data: messages, error: messagesError } = await supabase
      .from('client_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;

    // Get all unread counts
    const { data: unreadCounts, error: unreadError } = await supabase
      .rpc('get_unread_counts', { read_filter: false, sender_filter: true });

    if (unreadError) throw unreadError;

    // Map clients to conversations
    const conversations: Conversation[] = clients.map(client => {
      const clientMessages = messages?.filter(msg => msg.client_id === client.id) || [];
      const lastMessage = clientMessages[0];
      const unreadCount = unreadCounts?.find(count => count.client_id === client.id)?.unread_count || 0;

      return {
        clientId: client.id,
        clientName: client.name,
        lastMessage: lastMessage?.content,
        lastMessageTime: lastMessage ? new Date(lastMessage.created_at) : undefined,
        unreadCount: Number(unreadCount),
        messages: []
      };
    });

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const getMessagesForClient = async (clientId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('client_messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    // Mark messages as read
    await markMessagesAsRead(clientId);

    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      sender: {
        id: msg.sender_is_user ? clientId : 'accountant',
        name: msg.sender_is_user ? 'Client' : 'Your Accountant',
        isAccountant: !msg.sender_is_user
      },
      read: msg.read
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (clientId: string, content: string, isAccountant: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('client_messages')
      .insert({
        client_id: clientId,
        content,
        sender_is_user: !isAccountant,
        read: isAccountant // If accountant sends, it's already read
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

export const markMessagesAsRead = async (clientId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('client_messages')
      .update({ read: true })
      .eq('client_id', clientId)
      .eq('sender_is_user', true);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};
