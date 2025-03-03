
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ClientCard, { Client } from "./ClientCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(functionName: 'get_unread_counts'): Promise<{ data: T | null; error: Error | null }>;
  }
}

const ClientList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        const formattedClients = data.map(client => ({
          id: client.id,
          name: client.name,
          company: client.company,
          email: client.email,
          phone: client.phone,
          lastActivity: new Date(client.last_activity),
          // Calculate unread messages and pending files
          unreadMessages: null,
          pendingFiles: null,
        }));

        // Fetch unread message counts
        const { data: messageData, error: messageError } = await supabase
          .rpc('get_unread_counts');

        console.log('messageData', messageData)

        if (!messageError && messageData) {
          const messageCountMap = new Map();
          messageData.forEach(item => {
            messageCountMap.set(item.client_id, parseInt(item.count));
          });

          formattedClients.forEach(client => {
            if (messageCountMap.has(client.id)) {
              client.unreadMessages = messageCountMap.get(client.id);
            }
          });
        }

        // Set the clients data
        setClients(formattedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error fetching clients",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [toast]);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 slide-up">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search clients..."
          className="pl-9 bg-white border-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-lg animate-pulse bg-slate-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div key={client.id} className="scale-in">
                <ClientCard client={client} />
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? `No clients found for "${searchQuery}"` : "No clients yet. Add your first client!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientList;
