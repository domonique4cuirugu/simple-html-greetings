
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  lastActivity?: Date;
  unreadMessages?: number;
  pendingFiles?: number;
};

interface ClientCardProps {
  client: Client;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-medium h-full glass-card">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg tracking-tight">{client.name}</h3>
            <div className="flex items-center text-muted-foreground">
              <Building className="h-3.5 w-3.5 mr-1" />
              <span className="text-sm">{client.company}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex items-center text-sm">
              <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="truncate">{client.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span>{client.phone}</span>
            </div>
          </div>

          {(client.unreadMessages || client.pendingFiles) && (
            <div className="flex gap-2 pt-3">
              {client.unreadMessages > 0 && (
                <div className="text-xs font-medium bg-black/5 px-2 py-1 rounded-full">
                  {client.unreadMessages} unread {client.unreadMessages === 1 ? "message" : "messages"}
                </div>
              )}
              {client.pendingFiles > 0 && (
                <div className="text-xs font-medium bg-black/5 px-2 py-1 rounded-full">
                  {client.pendingFiles} pending {client.pendingFiles === 1 ? "file" : "files"}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild variant="ghost" className="w-full justify-between group">
          <Link to={`/client/${client.id}`}>
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClientCard;
