import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Package, Users, ChartLine, ArrowLeft } from '@phosphor-icons/react';
import { Order, Customer, Transaction, View } from '@/lib/types';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { OrdersList } from '@/components/orders/OrdersList';
import { OrderDetail } from '@/components/orders/OrderDetail';
import { CustomersList } from '@/components/customers/CustomersList';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { Button } from '@/components/ui/button';

function App() {
  const [ordersData] = useKV<Order[]>('orders', []);
  const [customersData] = useKV<Customer[]>('customers', []);
  const [transactionsData] = useKV<Transaction[]>('transactions', []);
  
  const orders = ordersData ?? [];
  const customers = customersData ?? [];
  const transactions = transactionsData ?? [];
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-detail');
  };
  
  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentView('customer-detail');
  };
  
  const handleBack = () => {
    if (currentView === 'order-detail') {
      setCurrentView('orders');
      setSelectedOrderId(null);
    } else if (currentView === 'customer-detail') {
      setCurrentView('customers');
      setSelectedCustomerId(null);
    }
  };
  
  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;
  const orderTransactions = selectedOrder 
    ? transactions.filter(t => t.order_id === selectedOrder.id)
    : [];
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            orders={orders} 
            customers={customers}
            onViewOrder={handleViewOrder}
          />
        );
      case 'orders':
        return (
          <OrdersList 
            orders={orders}
            onViewOrder={handleViewOrder}
          />
        );
      case 'order-detail':
        return selectedOrder ? (
          <OrderDetail 
            order={selectedOrder}
            transactions={orderTransactions}
            onViewCustomer={handleViewCustomer}
          />
        ) : null;
      case 'customers':
        return (
          <CustomersList 
            customers={customers}
            onViewCustomer={handleViewCustomer}
          />
        );
      case 'customer-detail':
        return selectedCustomer ? (
          <CustomerDetail 
            customer={selectedCustomer}
            orders={orders.filter(o => o.customer_id === selectedCustomer.id)}
            onViewOrder={handleViewOrder}
          />
        ) : null;
      default:
        return null;
    }
  };
  
  const showBackButton = currentView === 'order-detail' || currentView === 'customer-detail';
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="gap-1.5"
              >
                <ArrowLeft weight="bold" className="w-4 h-4" />
                Back
              </Button>
            )}
            <h1 className="text-xl font-semibold tracking-tight text-primary">
              Print Shop OS
            </h1>
          </div>
          
          <nav className="flex items-center gap-1">
            <Button 
              variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('dashboard')}
              className="gap-1.5"
            >
              <ChartLine weight="bold" className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button 
              variant={currentView === 'orders' || currentView === 'order-detail' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { setCurrentView('orders'); setSelectedOrderId(null); }}
              className="gap-1.5"
            >
              <Package weight="bold" className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </Button>
            <Button 
              variant={currentView === 'customers' || currentView === 'customer-detail' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { setCurrentView('customers'); setSelectedCustomerId(null); }}
              className="gap-1.5"
            >
              <Users weight="bold" className="w-4 h-4" />
              <span className="hidden sm:inline">Customers</span>
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
