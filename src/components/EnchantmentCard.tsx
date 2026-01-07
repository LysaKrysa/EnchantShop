import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles } from 'lucide-react';
import { StockBadge } from '@/components/StockBadge';
import type { Enchantment } from '@/hooks/useEnchantments';

interface EnchantmentCardProps {
  enchantment: Enchantment;
  onAddToCart: (enchantment: Enchantment, offeredPrice: number) => void;
  cartQuantity: number;
  cartOfferedPrice?: number;
}

const EnchantmentCard = ({ enchantment, onAddToCart, cartQuantity, cartOfferedPrice }: EnchantmentCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState(cartOfferedPrice ?? enchantment.price);
  const isOutOfStock = enchantment.stock === 0;
  const isMaxInCart = cartQuantity >= enchantment.stock;
  const isOfferTooLow = offeredPrice < enchantment.price;

  const handleAddToCart = () => {
    if (offeredPrice < enchantment.price) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    if (isMaxInCart) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    setIsAnimating(true);
    onAddToCart(enchantment, offeredPrice);
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <Card
      className={`w-full min-w-0 overflow-hidden glass glass-hover group transition-all duration-300 ${isAnimating ? 'scale-95' : ''} ${isShaking ? 'animate-shake' : ''}`}
    >
      <CardContent className="p-3 text-left min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Sparkles className={`h-3.5 w-3.5 text-primary shrink-0 group-hover:animate-pulse-glow transition-all ${isAnimating ? 'scale-125' : ''}`} />
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{enchantment.name}</h3>
          </div>
          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full shrink-0 border border-primary/20">
            Lvl {enchantment.max_level}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{enchantment.description}</p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <StockBadge stock={enchantment.stock} />
            <span className="text-xs text-muted-foreground">
              Min: <span className="text-primary font-medium">${enchantment.price}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-xs text-muted-foreground shrink-0">$</span>
              <Input
                type="number"
                min={enchantment.price}
                inputMode="numeric"
                placeholder={String(enchantment.price)}
                value={offeredPrice || ''}
                onChange={(e) => setOfferedPrice(parseInt(e.target.value) || 0)}
                className={`h-7 w-full max-w-24 px-1 text-xs text-center bg-background/50 transition-all duration-300 ${isOfferTooLow ? 'border-destructive focus:ring-destructive/30' : 'border-border/50 focus:border-primary/50'}`}
              />
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`h-7 w-10 p-0 shrink-0 bg-primary hover:bg-primary/80 hover:glow-primary-sm transition-all duration-300 ${isAnimating ? 'animate-bounce glow-primary-sm' : ''}`}
            >
              {cartQuantity > 0 ? (
                <span className="text-xs font-bold">{cartQuantity}</span>
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnchantmentCard;
