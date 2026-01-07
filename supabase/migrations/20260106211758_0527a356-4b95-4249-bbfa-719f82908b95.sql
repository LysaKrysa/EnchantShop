-- Allow admins to read orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update orders (for completing them)
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to read order items
CREATE POLICY "Admins can view order items"
ON public.order_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));