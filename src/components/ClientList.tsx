
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ClientCard, { Client } from "./ClientCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ClientList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        
        // Fetch only profiles with "Client" role and completed onboarding
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, company_id')
          .eq('role', 'Client')
          .eq('onboarding_completed', true);
          
        if (profilesError) {
          throw profilesError;
        }
        
        if (!profilesData || profilesData.length === 0) {
          setClients([]);
          setLoading(false);
          return;
        }
        
        // Get the company details for each client profile
        const profileIds = profilesData.map(profile => profile.id);
        const companyIds = profilesData
          .filter(profile => profile.company_id)
          .map(profile => profile.company_id);
          
        // Get companies data
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds);
          
        if (companiesError) {
          throw companiesError;
        }
        
        // Create a map of company id to company name
        const companyMap = new Map();
        companiesData?.forEach(company => {
          companyMap.set(company.id, company.name);
        });
        
        // Get client data
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .order('name');
          
        if (clientsError) {
          throw clientsError;
        }
        
        // Fetch unread message counts
        const { data: messageData, error: messageError } = await supabase
          .rpc('get_unread_counts');

        if (messageError) {
          console.error("Error fetching unread counts:", messageError);
        }

        console.log('messageData', messageData);
        
        // Create message count map
        const messageCountMap = new Map();
        if (messageData) {
          messageData.forEach(item => {
            // Fix: Convert the unread_count to a number but pass it as a number to the Map
            messageCountMap.set(item.client_id, Number(item.unread_count));
          });
        }

        // Combine all the data to create client objects
        const formattedClients = clientsData.map(client => ({
          id: client.id,
          name: client.name,
          company: client.company,
          email: client.email,
          phone: client.phone,
          lastActivity: new Date(client.last_activity),
          unreadMessages: messageCountMap.has(client.id) ? messageCountMap.get(client.id) : null,
          pendingFiles: null,
        }));

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
