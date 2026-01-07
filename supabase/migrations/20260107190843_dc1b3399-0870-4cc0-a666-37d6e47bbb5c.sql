-- Create function to decrement stock safely
CREATE OR REPLACE FUNCTION public.decrement_stock(enchantment_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.enchantments
  SET stock = GREATEST(0, stock - amount)
  WHERE id = enchantment_id;
END;
$$;