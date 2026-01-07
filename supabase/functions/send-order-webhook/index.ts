import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  enchantment: string;
  enchantmentId: string;
  offeredPrice: number;
  quantity: number;
}

interface OrderRequest {
  discordUsername: string;
  minecraftUsername: string;
  items: OrderItem[];
  totalPrice: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { discordUsername, minecraftUsername, items, totalPrice }: OrderRequest = await req.json();

    console.log('Received order:', { discordUsername, minecraftUsername, itemCount: items.length, totalPrice });

    // Save order to database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        discord_username: discordUsername,
        minecraft_username: minecraftUsername,
        item_count: items.length,
        total_price: totalPrice,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('Order created:', order.id);

    // Save order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      enchantment_id: item.enchantmentId,
      enchantment_name: item.enchantment,
      price: item.offeredPrice * item.quantity,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
    }

    // Decrease stock for each purchased item
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        enchantment_id: item.enchantmentId,
        amount: item.quantity,
      });
      
      if (stockError) {
        console.error('Error updating stock for', item.enchantmentId, stockError);
      }
    }

    // Send to Discord webhook if configured
    if (webhookUrl) {
      const enchantmentList = items.map(item => 
        `• **${item.enchantment}** x${item.quantity} - $${item.offeredPrice * item.quantity} offered`
      ).join('\n');

      const embed = {
        title: '🔮 New Enchantment Order!',
        color: 0x9b59b6,
        fields: [
          {
            name: '👤 Discord',
            value: discordUsername,
            inline: true,
          },
          {
            name: '⛏️ Minecraft Username',
            value: minecraftUsername,
            inline: true,
          },
          {
            name: '💰 Total Offered',
            value: `$${totalPrice}`,
            inline: true,
          },
          {
            name: '✨ Enchantments',
            value: enchantmentList || 'No enchantments selected',
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'EnchantShop Order System',
        },
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Discord webhook error:', errorText);
      } else {
        console.log('Order sent successfully to Discord');
      }
    }

    return new Response(JSON.stringify({ success: true, orderId: order.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-order-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});