/**
 * Order Selector Modal
 *
 * Allows user to select an existing order/quote or create a new quote
 * when adding a product from the catalog to an order.
 */

import { useState, useEffect } from 'react';
import { MagnifyingGlass, Plus, CircleNotch, ShoppingCart, FileText } from '@phosphor-icons/react';
import { useOrdersList, type OrderListItem } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOrder: (order: OrderListItem) => void;
  onCreateNewQuote?: () => void;
}

export function OrderSelectorModal({
  open,
  onOpenChange,
  onSelectOrder,
  onCreateNewQuote,
}: OrderSelectorModalProps) {
  const [search, setSearch] = useState('');
  const { orders, loading } = useOrdersList({ limit: 20, page: 1 });

  // Filter orders by search
  const filteredOrders = search.trim()
    ? orders.filter(o =>
        o.visual_id.includes(search) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        (o.order_nickname && o.order_nickname.toLowerCase().includes(search.toLowerCase()))
      )
    : orders;

  // Get status color
  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('COMPLETE') || s.includes('PAID')) return 'bg-green-500/20 text-green-700';
    if (s.includes('QUOTE')) return 'bg-gray-500/20 text-gray-700';
    if (s.includes('PRODUCTION')) return 'bg-purple-500/20 text-purple-700';
    if (s.includes('PAYMENT')) return 'bg-amber-500/20 text-amber-700';
    return 'bg-blue-500/20 text-blue-700';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart size={20} />
            Add to Order
          </DialogTitle>
          <DialogDescription>
            Select an existing order or create a new quote
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Quote Button */}
          {onCreateNewQuote && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-12 border-dashed"
              onClick={() => {
                onCreateNewQuote();
                onOpenChange(false);
              }}
            >
              <Plus size={18} className="text-primary" />
              <span className="font-medium">Create New Quote</span>
            </Button>
          )}

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Search by order #, customer, or job name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Orders List */}
          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <CircleNotch size={24} className="animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground text-sm">Loading orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                    onClick={() => {
                      onSelectOrder(order);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-sm">
                            #{order.visual_id}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${getStatusColor(order.printavo_status_name)}`}
                          >
                            {order.printavo_status_name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {order.customer_name}
                          {order.order_nickname && (
                            <span className="text-muted-foreground/70"> • {order.order_nickname}</span>
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OrderSelectorModal;
