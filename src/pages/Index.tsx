import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEnchantments, useCategories, Enchantment } from '@/hooks/useEnchantments';
import EnchantmentCard from '@/components/EnchantmentCard';
import Cart from '@/components/Cart';
import { MobileCartBar } from '@/components/MobileCartBar';
import CategoryFilter from '@/components/CategoryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRealtimeEnchantments } from '@/hooks/useRealtimeEnchantments';
import { Sparkles, Search, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface CartItem {
  enchantment: Enchantment;
  quantity: number;
  offeredPrice: number;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { data: enchantments, isLoading } = useEnchantments();
  const categories = useCategories(enchantments);
  
  // Enable realtime stock updates
  useRealtimeEnchantments();

  const filteredEnchantments = enchantments?.filter((e) => {
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) ?? [];

  const handleAddToCart = (enchantment: Enchantment, offeredPrice: number) => {
    setCartItems((prev) => {
      const existing = prev.find(item => item.enchantment.id === enchantment.id);
      if (existing) {
        if (existing.quantity >= enchantment.stock) {
          toast({
            title: 'Stock limit reached',
            description: `Only ${enchantment.stock} available`,
            variant: 'destructive',
          });
          return prev;
        }
        return prev.map(item => 
          item.enchantment.id === enchantment.id 
            ? { ...item, quantity: item.quantity + 1, offeredPrice }
            : item
        );
      }
      return [...prev, { enchantment, quantity: 1, offeredPrice }];
    });
  };

  const handleUpdateQuantity = (enchantmentId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(enchantmentId);
      return;
    }
    setCartItems((prev) => 
      prev.map(item => 
        item.enchantment.id === enchantmentId 
          ? { ...item, quantity }
          : item
      )
    );
  };


  const handleRemoveFromCart = (enchantmentId: string) => {
    setCartItems((prev) => prev.filter((item) => item.enchantment.id !== enchantmentId));
  };

  const handleCheckout = async (discord: string, minecraft: string) => {
    if (!discord.trim() || !minecraft.trim() || cartItems.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your usernames and add at least one enchantment.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-order-webhook', {
        body: {
          discordUsername: discord,
          minecraftUsername: minecraft,
          items: cartItems.map((item) => ({ 
            enchantment: item.enchantment.name, 
            enchantmentId: item.enchantment.id,
            offeredPrice: item.offeredPrice,
            quantity: item.quantity 
          })),
          totalPrice: cartItems.reduce((sum, item) => sum + (item.offeredPrice * item.quantity), 0),
        },
      });

      if (error) throw error;

      toast({
        title: '✨ Order Submitted!',
        description: 'Your enchantment order has been sent. We will contact you soon!',
      });

      setCartItems([]);
      setDiscordUsername('');
      setMinecraftUsername('');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto py-8 md:py-16 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="text-center animate-fade-in">
              <div className="flex items-center justify-center gap-2 md:gap-4 mb-3 md:mb-5">
                <Sparkles className="h-6 w-6 md:h-12 md:w-12 text-primary animate-pulse-glow" />
                <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  EnchantShop
                </h1>
                <Sparkles className="h-6 w-6 md:h-12 md:w-12 text-primary animate-pulse-glow" />
              </div>
              <p className="text-sm md:text-xl text-muted-foreground max-w-md mx-auto">
                Purchase enchantments for your items
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-10 pb-28 md:pb-8 relative">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 md:gap-10 min-w-0">
          {/* Enchantments Grid */}
          <div className="space-y-4 md:space-y-6 min-w-0 overflow-hidden">
            <div className="flex flex-col gap-3 md:gap-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                <h2 className="text-xl md:text-2xl font-semibold">Available Enchantments</h2>
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Search enchantments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 glass border-border/50 focus:border-primary/50 focus:glow-primary-sm transition-all duration-300"
                  />
                </div>
              </div>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl bg-card/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {filteredEnchantments.map((enchantment, index) => {
                  const cartItem = cartItems.find(item => item.enchantment.id === enchantment.id);
                  return (
                    <div 
                      key={enchantment.id} 
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'backwards' }}
                    >
                      <EnchantmentCard
                        enchantment={enchantment}
                        onAddToCart={handleAddToCart}
                        cartQuantity={cartItem?.quantity ?? 0}
                        cartOfferedPrice={cartItem?.offeredPrice}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && filteredEnchantments.length === 0 && (
              <p className="text-center text-muted-foreground py-12 animate-fade-in">No enchantments found</p>
            )}
          </div>

          {/* Desktop Cart Sidebar */}
          {!isMobile && (
            <div className="lg:order-last hidden md:block animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <Cart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
                discordUsername={discordUsername}
                minecraftUsername={minecraftUsername}
                onDiscordChange={setDiscordUsername}
                onMinecraftChange={setMinecraftUsername}
                onCheckout={() => handleCheckout(discordUsername, minecraftUsername)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Cart Bar */}
      {isMobile && (
        <MobileCartBar
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemoveFromCart}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Footer - only on desktop */}
      {!isMobile && (
        <footer className="border-t border-border/50 py-4 md:py-6 mt-8 md:mt-12 bg-gradient-to-t from-card/30 to-transparent">
          <div className="container mx-auto text-center text-xs md:text-sm text-muted-foreground">
            <p>Payment is done in-game after order confirmation</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
