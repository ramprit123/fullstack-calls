import { useAuth } from "@clerk/clerk-react";
import { useAuthenticatedApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useApi = () => {
  const { isSignedIn } = useAuth();
  const api = useAuthenticatedApi();
  const queryClient = useQueryClient();

  // Get current user profile
  const useProfile = () => {
    return useQuery({
      queryKey: ["profile"],
      queryFn: async () => {
        const response = await api.get("/users/me");
        return response.data;
      },
      enabled: isSignedIn,
    });
  };

  // Update user profile
  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: async (data: {
        firstName?: string;
        lastName?: string;
        address?: any;
        preferences?: any;
      }) => {
        const response = await api.put("/users/me", data);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });
  };

  // Upload avatar
  const useUploadAvatar = () => {
    return useMutation({
      mutationFn: async (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file);
        const response = await api.post("/users/me/avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });
  };

  // Get all users (admin only)
  const useUsers = () => {
    return useQuery({
      queryKey: ["users"],
      queryFn: async () => {
        const response = await api.get("/users");
        return response.data;
      },
      enabled: isSignedIn,
    });
  };

  // Update user preferences
  const useUpdatePreferences = () => {
    return useMutation({
      mutationFn: async (preferences: any) => {
        const response = await api.put("/users/me/preferences", {
          preferences,
        });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });
  };

  // Update user address
  const useUpdateAddress = () => {
    return useMutation({
      mutationFn: async (address: any) => {
        const response = await api.put("/users/me/address", { address });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });
  };

  // Get user by ID (admin only)
  const useUserById = (id: string) => {
    return useQuery({
      queryKey: ["user", id],
      queryFn: async () => {
        const response = await api.get(`/users/${id}`);
        return response.data;
      },
      enabled: isSignedIn && !!id,
    });
  };

  return {
    useProfile,
    useUpdateProfile,
    useUploadAvatar,
    useUsers,
    useUpdatePreferences,
    useUpdateAddress,
    useUserById,
  };
};
