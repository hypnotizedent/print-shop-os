import { useState, useMemo } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MagnifyingGlass, Package } from '@phosphor-icons/react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/helpers';

interface OrdersListProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

const ALL_STATUSES: OrderStatus[] = ['QUOTE', 'NEW', 'ART APPROVAL', 'IN PRODUCTION', 'COMPLETE', 'SHIPPED'];

export function OrdersList({ orders, onViewOrder }: OrdersListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(o => 
        o.visual_id.toLowerCase().includes(searchLower) ||
        o.customer_name.toLowerCase().includes(searchLower) ||
        (o.nickname && o.nickname.toLowerCase().includes(searchLower))
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return b.total - a.total;
    });
    
    return result;
  }, [orders, search, statusFilter, sortBy]);
  
  const getTotalQuantity = (order: Order) => {
    return order.line_items.reduce((sum, item) => sum + item.quantity, 0);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and track all orders
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="order-search"
            placeholder="Search by order #, customer, or nickname..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'total')}>
          <SelectTrigger className="w-full sm:w-[140px] bg-card border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">By Date</SelectItem>
            <SelectItem value="total">By Total</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredOrders.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" weight="duotone" />
            <p className="text-muted-foreground">
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Items</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Due</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id}
                    onClick={() => onViewOrder(order.id)}
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">#{order.visual_id}</span>
                        {order.nickname && (
                          <span className="text-muted-foreground text-sm ml-2">{order.nickname}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {getTotalQuantity(order)} pcs
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(order.due_date)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
