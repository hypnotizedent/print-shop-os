import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MagnifyingGlass,
  Plus,
  FileText,
  Warning,
  ArrowClockwise
} from '@phosphor-icons/react';

interface QuotesListPageProps {
  onViewQuote: (quoteId: string) => void;
  onNewQuote: () => void;
}

// Placeholder quote type until API is ready
interface QuoteSummary {
  id: string;
  quote_number: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  customer_name: string;
  customer_company?: string;
  total: number;
  created_at: string;
}

const getStatusColor = (status: QuoteSummary['status']) => {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground';
    case 'sent':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'approved':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'rejected':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'expired':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function QuotesListPage({ onViewQuote, onNewQuote }: QuotesListPageProps) {
  const [searchInput, setSearchInput] = useState('');

  // Placeholder data - will be replaced with API call
  const quotes: QuoteSummary[] = [];
  const loading = false;
  const error = null;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Quotes</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Loading quotes...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-card rounded-lg border border-border" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Quotes</h2>
          </div>
        </div>
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-5 pb-5 text-center">
            <Warning size={40} className="mx-auto mb-3 text-destructive" />
            <h3 className="text-base font-semibold mb-1">Failed to Load Quotes</h3>
            <p className="text-xs text-muted-foreground mb-3">Unable to fetch quotes from API</p>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <ArrowClockwise size={16} />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Quotes</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            {quotes.length} total quotes
          </p>
        </div>
        <Button onClick={onNewQuote} size="sm" className="gap-2 h-9">
          <Plus size={16} weight="bold" />
          New Quote
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by quote number, customer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-card border-border h-9"
          />
        </div>
      </div>

      {quotes.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">No Quotes Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first quote to get started
            </p>
            <Button onClick={onNewQuote} className="gap-2">
              <Plus size={16} weight="bold" />
              Create Quote
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {quotes.map((quote) => (
            <Card
              key={quote.id}
              onClick={() => onViewQuote(quote.id)}
              className="bg-card/50 hover:bg-accent/50 border-border/50 cursor-pointer transition-colors hover:border-border"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{quote.quote_number}</span>
                      <Badge className={`${getStatusColor(quote.status)} uppercase text-[10px] font-semibold px-1.5 py-0 h-4`}>
                        {quote.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-foreground mt-1">
                      {quote.customer_name}
                    </h3>
                    {quote.customer_company && (
                      <p className="text-sm text-muted-foreground truncate">
                        {quote.customer_company}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-semibold text-foreground">
                      ${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
