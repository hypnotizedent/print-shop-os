import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FloppyDisk,
  Plus,
  User,
  Package,
  FileText,
  CalendarBlank
} from '@phosphor-icons/react';

interface QuoteBuilderPageProps {
  quoteId: string | null;
  onBack: () => void;
}

export function QuoteBuilderPage({ quoteId, onBack }: QuoteBuilderPageProps) {
  const isNewQuote = !quoteId;
  const [nickname, setNickname] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Placeholder - will be replaced with API integration
  const handleSave = () => {
    console.log('Saving quote...', { nickname, dueDate, notes });
    // TODO: Wire to API
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {isNewQuote ? 'New Quote' : `Quote ${quoteId}`}
              </h1>
              <Badge className="bg-muted text-muted-foreground uppercase text-xs">
                Draft
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isNewQuote ? 'Create a new quote for a customer' : 'Edit quote details'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <FloppyDisk size={16} className="mr-2" />
            Save Draft
          </Button>
          <Button disabled>
            Send Quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4" weight="bold" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customer-search" className="text-xs text-muted-foreground">
                    Search or select customer
                  </Label>
                  <Input
                    id="customer-search"
                    placeholder="Type to search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer search will be wired to API in next phase
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" weight="bold" />
                  Line Items
                </CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5 h-8">
                  <Plus size={14} />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-dashed border-border rounded-lg p-8 text-center">
                <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" weight="duotone" />
                <p className="text-sm text-muted-foreground mb-3">
                  No line items yet
                </p>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus size={14} />
                  Add First Item
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Line item editor will be ported from PrintShopPro in next phase
              </p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" weight="bold" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes" className="text-xs text-muted-foreground">
                    Internal Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes for your team..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1.5 resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quote Details */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nickname" className="text-xs text-muted-foreground">
                  Quote Nickname
                </Label>
                <Input
                  id="nickname"
                  placeholder="e.g., Summer Event Tees"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="due-date" className="text-xs text-muted-foreground">
                  Due Date
                </Label>
                <div className="relative mt-1.5">
                  <CalendarBlank className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary">$0.00</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Info */}
          <Card className="bg-muted/30 border-border">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground text-center">
                Quote Builder v2.2.0 - Phase 1
                <br />
                <span className="text-[10px]">API integration coming next</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
