import { Badge } from '@/components/ui/badge';
import { Clock, Package, AlertTriangle } from 'lucide-react';

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export const StockBadge = ({ stock, className }: StockBadgeProps) => {
  if (stock === 0) {
    return (
      <Badge variant="secondary" className={`bg-purple-500/20 text-purple-300 border-purple-500/30 ${className}`}>
        <Clock className="w-3 h-3 mr-1" />
        Coming Soon
      </Badge>
    );
  }
  
  if (stock <= 3) {
    return (
      <Badge variant="secondary" className={`bg-yellow-500/20 text-yellow-300 border-yellow-500/30 ${className}`}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        Low Stock ({stock})
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className={`bg-emerald-500/20 text-emerald-300 border-emerald-500/30 ${className}`}>
      <Package className="w-3 h-3 mr-1" />
      In Stock ({stock})
    </Badge>
  );
};
