import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface AuthenticatedQueryOptions<T>
  extends Omit<UseQueryOptions<T>, "queryFn"> {
  queryFn: (token: string) => Promise<T>;
}

export const useAuthenticatedQuery = <T>({
  queryFn,
  ...options
}: AuthenticatedQueryOptions<T>) => {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery({
    ...options,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      return queryFn(token);
    },
    enabled: isLoaded && isSignedIn && (options.enabled ?? true),
  });
};
