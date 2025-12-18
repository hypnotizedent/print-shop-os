import { SizeBreakdown } from '@/lib/types';

interface SizeGridProps {
  sizes: SizeBreakdown;
}

const SIZE_LABELS: (keyof SizeBreakdown)[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export function SizeGrid({ sizes }: SizeGridProps) {
  const total = Object.values(sizes).reduce((sum, qty) => sum + qty, 0);
  
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1 text-xs">
        {SIZE_LABELS.map(size => (
          <div 
            key={size}
            className="flex flex-col items-center min-w-[40px]"
          >
            <span className="text-muted-foreground font-medium px-2 py-1">
              {size}
            </span>
            <span 
              className={`px-2 py-1 rounded ${
                sizes[size] > 0 
                  ? 'bg-primary/20 text-primary font-medium' 
                  : 'text-muted-foreground/50'
              }`}
            >
              {sizes[size]}
            </span>
          </div>
        ))}
        <div className="flex flex-col items-center min-w-[50px] border-l border-border pl-1 ml-1">
          <span className="text-muted-foreground font-medium px-2 py-1">
            Total
          </span>
          <span className="px-2 py-1 font-semibold">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}
