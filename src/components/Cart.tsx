import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Trash2, Send, Loader2, Minus, Plus } from 'lucide-react';
import type { CartItem } from '@/pages/Index';
import { StockBadge } from '@/components/StockBadge';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (enchantmentId: string, quantity: number) => void;
  onRemove: (enchantmentId: string) => void;
  discordUsername: string;
  minecraftUsername: string;
  onDiscordChange: (value: string) => void;
  onMinecraftChange: (value: string) => void;
  onCheckout: () => void;
  isSubmitting: boolean;
}

const Cart = ({
  items,
  onUpdateQuantity,
  onRemove,
  discordUsername,
  minecraftUsername,
  onDiscordChange,
  onMinecraftChange,
  onCheckout,
  isSubmitting,
}: CartProps) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.offeredPrice * item.quantity), 0);
  const canSubmit = items.length > 0 && discordUsername.trim() && minecraftUsername.trim();

  return (
    <Card className="glass border-border/50 sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Your Order ({totalItems})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="discord" className="text-sm text-muted-foreground">Discord Username</Label>
            <Input
              id="discord"
              placeholder="Username"
              value={discordUsername}
              onChange={(e) => onDiscordChange(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="minecraft" className="text-sm text-muted-foreground">Minecraft Username</Label>
            <Input
              id="minecraft"
              placeholder="Steve"
              value={minecraftUsername}
              onChange={(e) => onMinecraftChange(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300 mt-1"
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="border-t border-border/50 pt-3">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Enchantments ({totalItems})</h4>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic">No enchantments added yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.enchantment.id} className="glass rounded-lg p-3 space-y-2 transition-all duration-300 hover:bg-card/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate flex-1">{item.enchantment.name}</span>
                    <button
                      onClick={() => onRemove(item.enchantment.id)}
                      className="text-destructive hover:text-destructive/80 hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StockBadge stock={item.enchantment.stock} />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-primary/20 transition-colors"
                          onClick={() => onUpdateQuantity(item.enchantment.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-5 text-center text-xs">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-primary/20 transition-colors"
                          onClick={() => onUpdateQuantity(item.enchantment.id, item.quantity + 1)}
                          disabled={item.quantity >= item.enchantment.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <span className="text-xs text-primary font-medium">${item.offeredPrice}/ea</span>
                  </div>
                  
                  <div className="flex items-center justify-end text-xs text-muted-foreground">
                    <span className="text-primary font-medium">= ${item.offeredPrice * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-border/50 pt-3">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Offer:</span>
            <span className="text-primary text-glow">${total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full bg-primary hover:bg-primary/80 hover:glow-primary transition-all duration-300"
            onClick={onCheckout}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Order
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Cart;
