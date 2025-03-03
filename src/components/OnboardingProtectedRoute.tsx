
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface OnboardingProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const OnboardingProtectedRoute: React.FC<OnboardingProtectedRouteProps> = ({ 
  children,
  requireOnboarding = true 
}) => {
  const { user, loading, onboardingCompleted, checkOnboardingStatus } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (user && !loading) {
        await checkOnboardingStatus();
        setChecking(false);
      } else if (!loading) {
        setChecking(false);
      }
    };
    
    check();
  }, [user, loading, checkOnboardingStatus]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If onboarding is required but not completed, redirect to onboarding
  if (requireOnboarding && !onboardingCompleted) {
    // Prevent infinite redirect loop if we're already on the onboarding page
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }
  }

  // If we're on the onboarding page but onboarding is completed, redirect to home
  if (location.pathname === "/onboarding" && onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default OnboardingProtectedRoute;
