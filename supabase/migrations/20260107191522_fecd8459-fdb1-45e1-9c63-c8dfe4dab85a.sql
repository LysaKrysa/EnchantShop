-- Create function to increment stock (for order cancellation)
CREATE OR REPLACE FUNCTION public.increment_stock(enchantment_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.enchantments
  SET stock = stock + amount
  WHERE id = enchantment_id;
END;
$$;