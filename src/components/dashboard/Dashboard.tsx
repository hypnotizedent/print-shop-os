import { Order, Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, CurrencyDollar, Clock } from '@phosphor-icons/react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate, getOrdersNeedingAttention } from '@/lib/helpers';

interface DashboardProps {
  orders: Order[];
  customers: Customer[];
  onViewOrder: (orderId: string) => void;
}

export function Dashboard({ orders, customers, onViewOrder }: DashboardProps) {
  const activeOrders = orders.filter(o => 
    o.status !== 'COMPLETE' && o.status !== 'SHIPPED'
  );
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const ordersNeedingAttention = getOrdersNeedingAttention(orders);
  
  const stats = [
    {
      title: 'Active Orders',
      value: activeOrders.length,
      icon: Package,
      description: `${orders.length} total orders`
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: CurrencyDollar,
      description: `From ${orders.length} orders`
    },
    {
      title: 'Customers',
      value: customers.length,
      icon: Users,
      description: 'Total customers'
    },
    {
      title: 'Needs Attention',
      value: ordersNeedingAttention.length,
      icon: Clock,
      description: 'Overdue or pending approval'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your print shop operations
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" weight="bold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No orders yet
              </p>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div 
                  key={order.id}
                  onClick={() => onViewOrder(order.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{order.visual_id}</span>
                        {order.nickname && (
                          <span className="text-muted-foreground text-sm">
                            {order.nickname}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-medium">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Orders Needing Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersNeedingAttention.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                All orders are on track
              </p>
            ) : (
              ordersNeedingAttention.slice(0, 5).map((order) => (
                <div 
                  key={order.id}
                  onClick={() => onViewOrder(order.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{order.visual_id}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDate(order.due_date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-destructive border-destructive/50">
                    {new Date(order.due_date) < new Date() ? 'Overdue' : 'Pending'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
