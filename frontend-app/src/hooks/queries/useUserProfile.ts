import { useAuthenticatedQuery } from "../useAuthenticatedQuery";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export const useUserProfile = () => {
  return useAuthenticatedQuery<UserProfile>({
    queryKey: ["user", "profile"],
    queryFn: async (token: any) => {
      const response = await api.get<UserProfile>("/user/profile", token);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
