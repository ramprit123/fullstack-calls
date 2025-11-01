import { type ReactNode } from "react";
import { ClerkProvider } from "./ClerkProvider";
import { QueryProvider } from "./QueryProvider";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ClerkProvider>
      <QueryProvider>{children}</QueryProvider>
    </ClerkProvider>
  );
};
