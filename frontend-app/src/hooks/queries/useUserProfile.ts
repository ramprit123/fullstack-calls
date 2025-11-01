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
    queryFn: (token) => api.get<UserProfile>("/user/profile", token),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
