import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlass, User } from '@phosphor-icons/react';

const API_BASE = 'https://mintprints-api.ronny.works';

interface Customer {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
}

interface CustomerSelectorProps {
  selected: Customer | null;
  onSelect: (customer: Customer | null) => void;
  onCreateNew: () => void;
}

export function CustomerSelector({ selected, onSelect, onCreateNew }: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search customers when search term changes
  useEffect(() => {
    if (search.length >= 2) {
      setLoading(true);
      fetch(`${API_BASE}/api/customers?search=${encodeURIComponent(search)}&limit=10`)
        .then(res => res.json())
        .then(data => {
          setResults(data.customers || []);
          setLoading(false);
        })
        .catch(() => {
          setResults([]);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selected) {
    // PrintShopPro CustomerSearch.tsx exact design:
    // Card with emerald avatar, name, company, email + phone, "Change" button
    return (
      <div className="p-4 border border-border rounded-lg bg-card">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/20 rounded-full p-2">
              <User size={20} className="text-emerald-500" weight="bold" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{selected.name}</div>
              {selected.company && (
                <div className="text-sm text-muted-foreground">{selected.company}</div>
              )}
              <div className="text-sm text-muted-foreground mt-1">
                {selected.email}
                {selected.phone && ` • ${selected.phone}`}
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            weight="bold"
          />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search customers..."
            className="w-full bg-secondary border border-input rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <button
          onClick={() => onCreateNew()}
          className="px-3 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          + New
        </button>
      </div>

      {isOpen && (search.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover rounded-lg border border-border max-h-60 overflow-y-auto shadow-lg z-50">
          {loading ? (
            <div className="p-3 text-muted-foreground text-sm">Searching...</div>
          ) : results.length > 0 ? (
            results.map(customer => (
              <div
                key={customer.id}
                onClick={() => {
                  onSelect(customer);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-0 transition-colors"
              >
                <div className="font-medium text-foreground text-sm">{customer.name}</div>
                {customer.company && (
                  <div className="text-xs text-muted-foreground">{customer.company}</div>
                )}
              </div>
            ))
          ) : search.length >= 2 ? (
            <div className="p-3 text-muted-foreground text-sm">No customers found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
