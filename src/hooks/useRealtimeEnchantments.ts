import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeEnchantments = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('enchantments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enchantments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['enchantments'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
