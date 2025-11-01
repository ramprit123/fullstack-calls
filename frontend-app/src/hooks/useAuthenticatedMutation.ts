import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface AuthenticatedMutationOptions<TData, TError, TVariables>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn"> {
  mutationFn: (variables: TVariables, token: string) => Promise<TData>;
}

export const useAuthenticatedMutation = <
  TData,
  TError = Error,
  TVariables = void
>({
  mutationFn,
  ...options
}: AuthenticatedMutationOptions<TData, TError, TVariables>) => {
  const { getToken } = useAuth();

  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      return mutationFn(variables, token);
    },
  });
};
