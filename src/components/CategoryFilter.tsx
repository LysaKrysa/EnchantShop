import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelect }: CategoryFilterProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 150;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full">
      {/* Left fade gradient */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none" />
      )}

      {/* Left arrow - desktop only */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur border shadow-sm hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="w-full overflow-x-auto scrollbar-hide md:px-8"
      >
        <div className="flex gap-2 pb-2 whitespace-nowrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(null)}
            className="shrink-0 h-8 text-xs"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelect(category)}
              className="shrink-0 h-8 text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Right fade gradient */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none" />
      )}

      {/* Right arrow - desktop only */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur border shadow-sm hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default CategoryFilter;
