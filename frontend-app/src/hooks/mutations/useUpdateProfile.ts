import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedApi } from "@/lib/api";

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

export const useUpdateProfile = () => {
  const api = useAuthenticatedApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await api.put("/user/profile", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
};