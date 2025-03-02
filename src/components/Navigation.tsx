
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, MessageSquare, FileText, Kanban } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-slate-900">
            Accountify
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-5">
              <NavLink to="/" active={pathname === "/"}>
                <Users className="h-4 w-4" />
                Clients
              </NavLink>
              <NavLink to="/messages" active={pathname === "/messages"}>
                <MessageSquare className="h-4 w-4" />
                Messages
              </NavLink>
              <NavLink to="/files" active={pathname === "/files"}>
                <FileText className="h-4 w-4" />
                Files
              </NavLink>
              <NavLink to="/kanban" active={pathname === "/kanban"}>
                <Kanban className="h-4 w-4" />
                Kanban
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      active
        ? "bg-black text-white"
        : "text-slate-600 hover:bg-slate-100"
    )}
  >
    {children}
  </Link>
);

export default Navigation;
