import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";
import { type ReactNode } from "react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

interface ClerkProviderProps {
  children: ReactNode;
}

export const ClerkProvider = ({ children }: ClerkProviderProps) => {
  return (
    <BaseClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined, // You can customize theme here
        variables: {
          colorPrimary: "#000000",
        },
      }}
      // Add allowed redirect origins for better compatibility
      allowedRedirectOrigins={[
        window.location.origin,
        // Add your production domain here
        // 'https://your-production-domain.com'
      ]}
    >
      {children}
    </BaseClerkProvider>
  );
};
