-- Create enchantments table for dynamic shop items
CREATE TABLE public.enchantments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  max_level INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 10,
  stock INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table to track purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_username TEXT NOT NULL,
  minecraft_username TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  item_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table to track individual items in orders
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  enchantment_id UUID NOT NULL REFERENCES public.enchantments(id) ON DELETE CASCADE,
  enchantment_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enchantments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Enchantments are publicly readable (shop items)
CREATE POLICY "Enchantments are viewable by everyone" 
ON public.enchantments 
FOR SELECT 
USING (true);

-- Orders can be inserted by anyone (no auth required for shop)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Order items can be inserted by anyone
CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enchantments_updated_at
BEFORE UPDATE ON public.enchantments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing enchantments data
INSERT INTO public.enchantments (name, max_level, description, category, price, stock) VALUES
-- Armor Enchantments
('Protection', 4, 'Reduces most types of damage', 'Armor', 10, 10),
('Fire Protection', 4, 'Reduces fire damage and burn time', 'Armor', 10, 10),
('Blast Protection', 4, 'Reduces explosion damage', 'Armor', 10, 10),
('Projectile Protection', 4, 'Reduces projectile damage', 'Armor', 10, 10),
('Thorns', 3, 'Damages attackers', 'Armor', 12, 8),
-- Helmet Enchantments
('Respiration', 3, 'Extends underwater breathing time', 'Helmet', 10, 10),
('Aqua Affinity', 1, 'Increases underwater mining speed', 'Helmet', 8, 10),
-- Boots Enchantments
('Feather Falling', 4, 'Reduces fall damage', 'Boots', 10, 10),
('Depth Strider', 3, 'Increases underwater movement speed', 'Boots', 10, 10),
('Frost Walker', 2, 'Freezes water beneath the player', 'Boots', 15, 5),
('Soul Speed', 3, 'Increases speed on soul sand and soul soil', 'Boots', 12, 7),
('Swift Sneak', 3, 'Increases sneaking speed', 'Boots', 12, 7),
-- Sword Enchantments
('Sharpness', 5, 'Increases damage', 'Sword', 10, 10),
('Smite', 5, 'Increases damage to undead mobs', 'Sword', 10, 10),
('Bane of Arthropods', 5, 'Increases damage to arthropods', 'Sword', 10, 10),
('Knockback', 2, 'Increases knockback', 'Sword', 8, 10),
('Fire Aspect', 2, 'Sets target on fire', 'Sword', 12, 8),
('Looting', 3, 'Increases mob drops', 'Sword', 15, 5),
('Sweeping Edge', 3, 'Increases sweeping attack damage', 'Sword', 10, 10),
-- Tool Enchantments
('Efficiency', 5, 'Increases mining speed', 'Tools', 10, 10),
('Silk Touch', 1, 'Mined blocks drop themselves', 'Tools', 20, 3),
('Fortune', 3, 'Increases certain block drops', 'Tools', 15, 5),
-- Bow Enchantments
('Power', 5, 'Increases arrow damage', 'Bow', 10, 10),
('Punch', 2, 'Increases arrow knockback', 'Bow', 8, 10),
('Flame', 1, 'Arrows set target on fire', 'Bow', 12, 8),
('Infinity', 1, 'Shooting consumes no arrows', 'Bow', 20, 3),
-- Crossbow Enchantments
('Multishot', 1, 'Shoots 3 arrows at once', 'Crossbow', 15, 5),
('Piercing', 4, 'Arrows pass through entities', 'Crossbow', 10, 10),
('Quick Charge', 3, 'Decreases crossbow charging time', 'Crossbow', 10, 10),
-- Trident Enchantments
('Loyalty', 3, 'Trident returns after being thrown', 'Trident', 12, 8),
('Impaling', 5, 'Extra damage to aquatic mobs', 'Trident', 10, 10),
('Riptide', 3, 'Trident launches player in water', 'Trident', 15, 5),
('Channeling', 1, 'Summons lightning on hit during storms', 'Trident', 18, 4),
-- Fishing Rod Enchantments
('Luck of the Sea', 3, 'Increases luck while fishing', 'Fishing Rod', 12, 8),
('Lure', 3, 'Decreases wait time for fish', 'Fishing Rod', 10, 10),
-- Universal Enchantments
('Unbreaking', 3, 'Increases item durability', 'Universal', 10, 10),
('Mending', 1, 'Repairs item using XP', 'Universal', 25, 2);