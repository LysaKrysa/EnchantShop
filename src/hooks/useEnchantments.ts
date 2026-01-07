import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Enchantment {
  id: string;
  name: string;
  max_level: number;
  description: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEnchantments = () => {
  return useQuery({
    queryKey: ['enchantments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enchantments')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Enchantment[];
    },
  });
};

export const useAllEnchantments = () => {
  return useQuery({
    queryKey: ['enchantments', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enchantments')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Enchantment[];
    },
  });
};

export const useCategories = (enchantments: Enchantment[] | undefined) => {
  if (!enchantments) return [];
  return [...new Set(enchantments.map(e => e.category))];
};

export const useCreateEnchantment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (enchantment: Omit<Enchantment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('enchantments')
        .insert(enchantment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enchantments'] });
    },
  });
};

export const useUpdateEnchantment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Enchantment> & { id: string }) => {
      const { data, error } = await supabase
        .from('enchantments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enchantments'] });
    },
  });
};

export const useDeleteEnchantment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enchantments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enchantments'] });
    },
  });
};
