
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingProtectedRoute from "@/components/OnboardingProtectedRoute";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Kanban from "@/pages/Kanban";
import ClientDetail from "@/pages/ClientDetail";
import Messages from "@/pages/Messages";
import Files from "@/pages/Files";
import Onboarding from "@/pages/Onboarding";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground font-sans">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  <OnboardingProtectedRoute>
                    <Navigation />
                    <div className="container mx-auto px-4 py-6">
                      <Index />
                    </div>
                  </OnboardingProtectedRoute>
                } 
              />
              <Route
                path="/kanban"
                element={
                  <OnboardingProtectedRoute>
                    <Navigation />
                    <div className="container mx-auto px-4 py-6">
                      <Kanban />
                    </div>
                  </OnboardingProtectedRoute>
                }
              />
              <Route
                path="/client/:id"
                element={
                  <OnboardingProtectedRoute>
                    <Navigation />
                    <div className="container mx-auto px-4 py-6">
                      <ClientDetail />
                    </div>
                  </OnboardingProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <OnboardingProtectedRoute>
                    <Navigation />
                    <div className="container mx-auto px-4 py-6">
                      <Messages />
                    </div>
                  </OnboardingProtectedRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <OnboardingProtectedRoute>
                    <Navigation />
                    <div className="container mx-auto px-4 py-6">
                      <Files />
                    </div>
                  </OnboardingProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
