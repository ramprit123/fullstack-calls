import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

export const useAuth = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { 
    getToken, 
    signOut, 
    isLoaded: authLoaded,
    userId 
  } = useClerkAuth();

  const isLoaded = userLoaded && authLoaded;

  return {
    user,
    isSignedIn: isSignedIn && !!user,
    isLoaded,
    userId,
    getToken,
    signOut,
  };
};