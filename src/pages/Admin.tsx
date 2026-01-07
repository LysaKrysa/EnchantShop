import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, Minus, LogOut, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { StockBadge } from '@/components/StockBadge';
import { useRealtimeEnchantments } from '@/hooks/useRealtimeEnchantments';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  useAllEnchantments, 
  useCategories,
  useCreateEnchantment, 
  useUpdateEnchantment, 
  useDeleteEnchantment,
  Enchantment 
} from '@/hooks/useEnchantments';

const CATEGORIES = ['Armor', 'Helmet', 'Boots' , 'Chestplate', 'Leggings' , 'Sword', 'Tools', 'Ranged', 'Trident', 'Mace' , 'Spear' ,  'Fishing Rod', 'Universal', 'Other', ];

interface EnchantmentFormData {
  name: string;
  max_level: number;
  description: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
}

const defaultFormData: EnchantmentFormData = {
  name: '',
  max_level: 1,
  description: '',
  category: 'Universal',
  price: 10,
  stock: 10,
  is_active: true,
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading, user } = useIsAdmin();
  
  const { data: enchantments, isLoading } = useAllEnchantments();
  const categories = useCategories(enchantments);
  const createEnchantment = useCreateEnchantment();
  const updateEnchantment = useUpdateEnchantment();
  const deleteEnchantment = useDeleteEnchantment();
  
  useRealtimeEnchantments();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEnchantment, setEditingEnchantment] = useState<Enchantment | null>(null);
  const [formData, setFormData] = useState<EnchantmentFormData>(defaultFormData);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredEnchantments = enchantments?.filter(e => 
    filterCategory === 'all' || e.category === filterCategory
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSubmit = async () => {
    try {
      if (editingEnchantment) {
        await updateEnchantment.mutateAsync({ id: editingEnchantment.id, ...formData });
        toast({ title: 'Enchantment updated successfully' });
      } else {
        await createEnchantment.mutateAsync(formData);
        toast({ title: 'Enchantment created successfully' });
      }
      setIsAddDialogOpen(false);
      setEditingEnchantment(null);
      setFormData(defaultFormData);
    } catch (error) {
      toast({ title: 'Error saving enchantment', variant: 'destructive' });
    }
  };

  const handleEdit = (enchantment: Enchantment) => {
    setEditingEnchantment(enchantment);
    setFormData({
      name: enchantment.name,
      max_level: enchantment.max_level,
      description: enchantment.description,
      category: enchantment.category,
      price: enchantment.price,
      stock: enchantment.stock,
      is_active: enchantment.is_active,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this enchantment?')) {
      try {
        await deleteEnchantment.mutateAsync(id);
        toast({ title: 'Enchantment deleted successfully' });
      } catch (error) {
        toast({ title: 'Error deleting enchantment', variant: 'destructive' });
      }
    }
  };

  const handleStockChange = async (enchantment: Enchantment, delta: number) => {
    const newStock = Math.max(0, enchantment.stock + delta);
    try {
      await updateEnchantment.mutateAsync({ id: enchantment.id, stock: newStock });
    } catch (error) {
      toast({ title: 'Error updating stock', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (enchantment: Enchantment) => {
    try {
      await updateEnchantment.mutateAsync({ id: enchantment.id, is_active: !enchantment.is_active });
    } catch (error) {
      toast({ title: 'Error updating enchantment', variant: 'destructive' });
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingEnchantment(null);
    setFormData(defaultFormData);
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>
              Sign in to manage enchantments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <div className="text-center">
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

  // Show access denied if logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Access Denied</CardTitle>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>
              You don't have admin permissions. Contact an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <div className="text-center">
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage enchantments and stock</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/orders')}>
              <Package className="h-4 w-4 mr-2" />
              Orders
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => open ? setIsAddDialogOpen(true) : handleDialogClose()}>
              <DialogTrigger asChild>
                <Button onClick={() => { setFormData(defaultFormData); setEditingEnchantment(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Enchantment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingEnchantment ? 'Edit Enchantment' : 'Add Enchantment'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                      placeholder="Sharpness"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_level">Max Level</Label>
                      <Input
                        id="max_level"
                        type="number"
                        min={1}
                        max={10}
                        value={formData.max_level}
                        onChange={(e) => setFormData(f => ({ ...f, max_level: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                      placeholder="Increases damage"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Suggested Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min={1}
                        value={formData.price}
                        onChange={(e) => setFormData(f => ({ ...f, price: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        min={0}
                        value={formData.stock}
                        onChange={(e) => setFormData(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active in Shop</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(f => ({ ...f, is_active: checked }))}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.description || createEnchantment.isPending || updateEnchantment.isPending}
                  >
                    {editingEnchantment ? 'Save Changes' : 'Add Enchantment'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="icon" onClick={handleLogout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid gap-3">
            {filteredEnchantments?.map((enchantment) => (
              <Card key={enchantment.id} className={`${!enchantment.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{enchantment.name}</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {enchantment.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Lvl {enchantment.max_level}
                        </span>
                        {!enchantment.is_active && (
                          <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">{enchantment.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-bold text-primary">${enchantment.price} suggested</span>
                        <StockBadge stock={enchantment.stock} />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStockChange(enchantment, -1)}
                          disabled={enchantment.stock === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{enchantment.stock}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStockChange(enchantment, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleActive(enchantment)}
                        title={enchantment.is_active ? 'Hide from shop' : 'Show in shop'}
                      >
                        {enchantment.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      
                      <Button variant="outline" size="icon" onClick={() => handleEdit(enchantment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(enchantment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
