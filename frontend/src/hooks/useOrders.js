import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useOrders = (params = {}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => api.get('/orders', { params }),
    placeholderData: (previousData) => previousData,
  });
};

export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // products stock was updated
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // cancelled inventory counts were restored
    },
  });
};

export const useUpdateOrder = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put(`/orders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // stock might change!
    },
  });
};
