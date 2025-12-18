import { OrderStatus, CustomerTier, ImprintMethod, PaymentMethod } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    'QUOTE': 'bg-slate-500/20 text-slate-300',
    'NEW': 'bg-blue-500/20 text-blue-300',
    'ART APPROVAL': 'bg-yellow-500/20 text-yellow-300',
    'IN PRODUCTION': 'bg-purple-500/20 text-purple-300',
    'COMPLETE': 'bg-green-500/20 text-green-300',
    'SHIPPED': 'bg-emerald-500/20 text-emerald-300'
  };
  return colors[status];
}

export function getTierColor(tier: CustomerTier): string {
  const colors: Record<CustomerTier, string> = {
    'bronze': 'bg-amber-700/20 text-amber-400',
    'silver': 'bg-slate-400/20 text-slate-300',
    'gold': 'bg-yellow-500/20 text-yellow-400',
    'platinum': 'bg-cyan-500/20 text-cyan-300'
  };
  return colors[tier];
}

export function getMethodLabel(method: ImprintMethod): string {
  const labels: Record<ImprintMethod, string> = {
    'screen-print': 'Screen Print',
    'dtg': 'DTG',
    'embroidery': 'Embroidery',
    'vinyl': 'Vinyl',
    'digital-transfer': 'Digital Transfer'
  };
  return labels[method];
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    'cash': 'Cash',
    'check': 'Check',
    'card': 'Card',
    'venmo': 'Venmo',
    'zelle': 'Zelle',
    'paypal': 'PayPal',
    'bank-transfer': 'Bank Transfer'
  };
  return labels[method];
}

import { Order } from './types';

export function getOrdersNeedingAttention(orders: Order[]): Order[] {
  const now = new Date();
  return orders.filter(order => {
    if (order.status === 'COMPLETE' || order.status === 'SHIPPED') return false;
    const dueDate = new Date(order.due_date);
    const isOverdue = dueDate < now;
    const isPendingApproval = order.status === 'ART APPROVAL';
    return isOverdue || isPendingApproval;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function calculateOrderTotals(order: Order): { subtotal: number; tax: number; total: number } {
  const subtotal = order.line_items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}
