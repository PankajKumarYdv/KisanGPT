import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../services/api/axiosClient.js';

export const alertKeys = {
  all: ['alerts'],
  lists: () => [...alertKeys.all, 'list'],
  list: (params) => [...alertKeys.lists(), params],
  unread: (farmerId) => [...alertKeys.all, 'unread', farmerId],
};

// Fetch alerts list
export const useAlertsList = (params = {}) => {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: async () => {
      const { data } = await axiosClient.get('/alerts', { params });
      return data; // returns { success, statusCode, message, data: { records, pagination } } or similar standard layout
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Fetch unread alerts
export const useUnreadAlerts = (farmerId) => {
  return useQuery({
    queryKey: alertKeys.unread(farmerId),
    queryFn: async () => {
      if (!farmerId) return [];
      const { data } = await axiosClient.get('/alerts/unread', { params: { farmerId } });
      return data.data || []; // Returns unread alerts list
    },
    enabled: !!farmerId,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Mark single alert as read
export const useMarkAlertRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosClient.patch(`/alerts/${id}/read`);
      return data.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
};

// Mark all alerts as read
export const useMarkAllAlertsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertIds = []) => {
      const promises = alertIds.map((id) => axiosClient.patch(`/alerts/${id}/read`));
      await Promise.all(promises);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
};

// Delete alert
export const useDeleteAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosClient.delete(`/alerts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
};
