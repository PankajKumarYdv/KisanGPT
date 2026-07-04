import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../services/api/axiosClient.js';

// Query Keys
export const farmerKeys = {
  all: ['farmers'],
  lists: () => [...farmerKeys.all, 'list'],
  list: (params) => [...farmerKeys.lists(), params],
  details: () => [...farmerKeys.all, 'detail'],
  detail: (id) => [...farmerKeys.details(), id],
};

// Fetch farmers list
export const useFarmersList = (params = {}) => {
  return useQuery({
    queryKey: farmerKeys.list(params),
    queryFn: async () => {
      const { data } = await axiosClient.get('/farmers', { params });
      return data; // standard Response standard shape contains { success, statusCode, message, data: records, meta: pagination }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Fetch single farmer profile
export const useFarmerDetail = (id) => {
  return useQuery({
    queryKey: farmerKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosClient.get(`/farmers/${id}`);
      return data.data; // Standard response: { success, statusCode, message, data }
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Fetch current logged in farmer's profile (for non-admin users)
export const useCurrentFarmer = () => {
  return useQuery({
    queryKey: ['farmers', 'current'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/farmers', { params: { limit: 1 } });
      return data.data?.[0] || null;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};


// Create farmer profile
export const useCreateFarmer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (farmerData) => {
      const { data } = await axiosClient.post('/farmers', farmerData);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate both lists and detail query caches
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
    },
  });
};

// Update farmer profile
export const useUpdateFarmer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, farmerData }) => {
      const { data } = await axiosClient.patch(`/farmers/${id}`, farmerData);
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.list() });
      queryClient.invalidateQueries({ queryKey: farmerKeys.detail(variables.id) });
    },
  });
};

// Delete farmer profile (soft delete)
export const useDeleteFarmer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosClient.delete(`/farmers/${id}`);
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.list() });
      queryClient.invalidateQueries({ queryKey: farmerKeys.detail(id) });
    },
  });
};
