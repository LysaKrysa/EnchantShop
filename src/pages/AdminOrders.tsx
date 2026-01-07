import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Package, LogOut, Sparkles, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Order {
  id: string;
  discord_username: string;
  minecraft_username: string;
  total_price: number;
  item_count: number;
  status: string;
  created_at: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [storedPassword, setStoredPassword] = useState(() => 
    sessionStorage.getItem('admin_password') || ''
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('admin_password');
  });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { data: orders, isLoading, refetch, error } = useQuery({
    queryKey: ['admin-orders', storedPassword],
    queryFn: async () => {
      console.log('Fetching orders with password:', storedPassword ? '***' : 'none');
      const { data, error } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'list', password: storedPassword },
      });
      console.log('Response:', data, error);
      if (error) throw error;
      if (data?.error) {
        if (data.error === 'Unauthorized') {
          setIsAuthenticated(false);
          sessionStorage.removeItem('admin_password');
          throw new Error('Invalid password');
        }
        throw new Error(data.error);
      }
      return (data?.orders || []) as Order[];
    },
    enabled: isAuthenticated && !!storedPassword,
    retry: false,
  });

  const completeOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'complete', password: storedPassword, orderId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      refetch();
      toast({ title: 'Order marked as completed!' });
    },
    onError: () => {
      toast({ title: 'Error updating order', variant: 'destructive' });
    },
  });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'cancel', password: storedPassword, orderId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      refetch();
      toast({ title: 'Order cancelled and stock restored!' });
    },
    onError: () => {
      toast({ title: 'Error cancelling order', variant: 'destructive' });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // Test the password by making a request
    const { data, error } = await supabase.functions.invoke('admin-orders', {
      body: { action: 'list', password },
    });
    
    if (error || data?.error === 'Unauthorized') {
      setPasswordError('Incorrect password');
      return;
    }
    
    sessionStorage.setItem('admin_password', password);
    setStoredPassword(password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStoredPassword('');
    sessionStorage.removeItem('admin_password');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Enter the admin password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-background/50 border-primary/30"
                  />
                </div>
                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              </div>
              <Button type="submit" className="w-full">Access Orders</Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Orders</h1>
              <p className="text-xs text-muted-foreground">View and complete customer orders</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

              {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading orders...</p>
        ) : error ? (
          <p className="text-center text-destructive py-12">Error loading orders. Please re-login.</p>
        ) : !orders || orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className={order.status === 'completed' || order.status === 'cancelled' ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{order.minecraft_username}</span>
                        <Badge variant={
                          order.status === 'completed' ? 'secondary' : 
                          order.status === 'cancelled' ? 'destructive' : 'default'
                        }>
                          {order.status === 'completed' ? (
                            <><Check className="h-3 w-3 mr-1" /> Completed</>
                          ) : order.status === 'cancelled' ? (
                            <><X className="h-3 w-3 mr-1" /> Cancelled</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Discord: {order.discord_username}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" /> {order.item_count} items
                        </span>
                        <span className="text-primary font-bold">Offered: ${order.total_price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive"
                          onClick={() => cancelOrder.mutate(order.id)}
                          disabled={cancelOrder.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => completeOrder.mutate(order.id)}
                          disabled={completeOrder.isPending}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}