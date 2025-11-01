import { type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SignIn } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <SignIn />
        </div>
      )
    );
  }

  return <>{children}</>;
};
