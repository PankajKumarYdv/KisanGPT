import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../services/api/axiosClient.js';

export const assessmentKeys = {
  all: ['assessments'],
  lists: () => [...assessmentKeys.all, 'list'],
  list: (params) => [...assessmentKeys.lists(), params],
  details: () => [...assessmentKeys.all, 'detail'],
  detail: (id) => [...assessmentKeys.details(), id],
};

// Fetch assessments list
export const useAssessmentsList = (params = {}) => {
  return useQuery({
    queryKey: assessmentKeys.list(params),
    queryFn: async () => {
      const { data } = await axiosClient.get('/assessments', { params });
      return data; // standard Response shape: { success, statusCode, message, data: records, meta: pagination }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Fetch single assessment detail
export const useAssessmentDetail = (id) => {
  return useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosClient.get(`/assessments/${id}`);
      return data.data; // standard Response shape: { success, statusCode, message, data: record }
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Create assessment record
export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assessmentData) => {
      const { data } = await axiosClient.post('/assessments', assessmentData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
    },
  });
};

// Update assessment record
export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assessmentData }) => {
      const { data } = await axiosClient.patch(`/assessments/${id}`, assessmentData);
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.list() });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(variables.id) });
    },
  });
};

// Delete assessment record
export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosClient.delete(`/assessments/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
    },
  });
};
