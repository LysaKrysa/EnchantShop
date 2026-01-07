import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminPassword = Deno.env.get('ADMIN_PASSWORD') || 'enchant2024';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, password, orderId } = await req.json();

    console.log('Admin orders action:', action);

    // Verify admin password
    if (password !== adminPassword) {
      console.log('Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list') {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Found orders:', orders?.length || 0);

      return new Response(JSON.stringify({ orders: orders || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'complete' && orderId) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (error) {
        console.error('Error completing order:', error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'cancel' && orderId) {
      // Get order items to restore stock
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('enchantment_id, quantity')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        throw itemsError;
      }

      console.log('Order items to restore:', orderItems);

      // Restore stock for each item
      for (const item of orderItems || []) {
        const { error: stockError } = await supabase.rpc('increment_stock', {
          enchantment_id: item.enchantment_id,
          amount: item.quantity || 1,
        });
        
        if (stockError) {
          console.error('Error restoring stock for', item.enchantment_id, stockError);
        }
      }

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) {
        console.error('Error cancelling order:', error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});