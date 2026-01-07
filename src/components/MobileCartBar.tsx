import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Trash2, Minus, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StockBadge } from '@/components/StockBadge';
import type { CartItem } from '@/pages/Index';

interface MobileCartBarProps {
  items: CartItem[];
  onUpdateQuantity: (enchantmentId: string, quantity: number) => void;
  onRemove: (enchantmentId: string) => void;
  onCheckout: (discordUsername: string, minecraftUsername: string) => void;
  isSubmitting: boolean;
}

export const MobileCartBar = ({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout, 
  isSubmitting 
}: MobileCartBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [discordUsername, setDiscordUsername] = useState('');
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [isBouncing, setIsBouncing] = useState(false);
  const prevTotalRef = useRef(0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.offeredPrice * item.quantity), 0);

  // Trigger bounce when items are added
  useEffect(() => {
    if (totalItems > prevTotalRef.current && totalItems > 0) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 400);
    }
    prevTotalRef.current = totalItems;
  }, [totalItems]);

  const handleCheckout = () => {
    if (discordUsername && minecraftUsername && items.length > 0) {
      onCheckout(discordUsername, minecraftUsername);
      setDiscordUsername('');
      setMinecraftUsername('');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 px-4 py-3 md:hidden animate-fade-in">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="w-full flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`relative ${isBouncing ? 'animate-bounce' : ''}`}>
                  <ShoppingCart className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
                  {totalItems > 0 && (
                    <span className={`absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold ${isBouncing ? 'animate-bounce' : 'animate-scale-in'}`}>
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {totalItems === 0 ? 'Your cart is empty' : `${totalItems} item${totalItems > 1 ? 's' : ''}`}
                  </p>
                  {totalItems > 0 && (
                    <p className="text-xs text-muted-foreground">Tap to view cart</p>
                  )}
                </div>
              </div>
              {totalItems > 0 && (
                <span className="text-lg font-bold text-primary">${totalPrice}</span>
              )}
            </button>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[85vh] rounded-t-xl p-0 glass border-border/50">
            <SheetHeader className="px-4 py-3 border-b border-border/50">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Cart ({totalItems} items)
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col h-[calc(85vh-60px)]">
              {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground animate-fade-in">
                  Your cart is empty
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 px-4 py-3">
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div 
                          key={item.enchantment.id} 
                          className="glass rounded-lg p-3 space-y-2 animate-fade-in-up transition-all duration-300 hover:bg-card/60"
                          style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'backwards' }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{item.enchantment.name}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:scale-110 transition-all duration-200"
                              onClick={() => onRemove(item.enchantment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <StockBadge stock={item.enchantment.stock} />
                              <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1 border border-border/50">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-primary/20 transition-colors"
                                  onClick={() => onUpdateQuantity(item.enchantment.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-primary/20 transition-colors"
                                  onClick={() => onUpdateQuantity(item.enchantment.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.enchantment.stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <span className="text-sm text-primary font-medium">${item.offeredPrice}/ea</span>
                          </div>
                          
                          <div className="flex items-center justify-end text-xs">
                            <span className="text-primary font-medium">Subtotal: ${item.offeredPrice * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="border-t border-border/50 p-4 space-y-4 bg-card/80 backdrop-blur">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Offer:</span>
                      <span className="text-primary">${totalPrice}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="mobile-discord" className="text-xs">Discord</Label>
                        <Input
                          id="mobile-discord"
                          placeholder="Username"
                          value={discordUsername}
                          onChange={(e) => setDiscordUsername(e.target.value)}
                          className="h-9 mt-1 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mobile-minecraft" className="text-xs">Minecraft</Label>
                        <Input
                          id="mobile-minecraft"
                          placeholder="Steve"
                          value={minecraftUsername}
                          onChange={(e) => setMinecraftUsername(e.target.value)}
                          className="h-9 mt-1 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full h-12 text-base bg-primary hover:bg-primary/80 hover:glow-primary transition-all duration-300" 
                      onClick={handleCheckout}
                      disabled={!discordUsername || !minecraftUsername || items.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
