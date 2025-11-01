import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { api } from '@/lib/api';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

export const useUpdateProfile = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      return api.put('/user/profile', data, token);
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};