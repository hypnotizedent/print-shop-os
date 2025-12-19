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

// Status colors matching dashboard (handles both category and Printavo status names)
export function getAPIStatusColor(status: string): string {
  const normalized = status.toLowerCase().replace(/[_\s]+/g, '_');
  const colors: Record<string, string> = {
    // Category-based (from production-stats)
    'quote': 'bg-amber-500/20 text-amber-400',
    'art': 'bg-purple-500/20 text-purple-400',
    'screenprint': 'bg-blue-500/20 text-blue-400',
    'embroidery': 'bg-pink-500/20 text-pink-400',
    'dtg': 'bg-cyan-500/20 text-cyan-400',
    'fulfillment': 'bg-orange-500/20 text-orange-400',
    'complete': 'bg-green-500/20 text-green-400',
    // Printavo status names
    'new': 'bg-blue-500/20 text-blue-400',
    'art_approval': 'bg-purple-500/20 text-purple-400',
    'artwork_approved': 'bg-purple-500/20 text-purple-400',
    'payment_needed': 'bg-amber-500/20 text-amber-400',
    'in_production': 'bg-blue-500/20 text-blue-400',
    'screen_print_production': 'bg-blue-500/20 text-blue-400',
    'embroidery_production': 'bg-pink-500/20 text-pink-400',
    'dtg_production': 'bg-cyan-500/20 text-cyan-400',
    'ready': 'bg-orange-500/20 text-orange-400',
    'ready_for_pickup': 'bg-orange-500/20 text-orange-400',
    'shipped': 'bg-green-500/20 text-green-400',
    'delivered': 'bg-green-500/20 text-green-400',
    'on_hold': 'bg-red-500/20 text-red-400',
    'cancelled': 'bg-slate-500/20 text-slate-400',
  };
  return colors[normalized] || 'bg-slate-500/20 text-slate-400';
}

// Human-readable status labels
export function getAPIStatusLabel(status: string): string {
  const normalized = status.toLowerCase().replace(/[_\s]+/g, '_');
  const labels: Record<string, string> = {
    // Category-based
    'quote': 'Quote',
    'art': 'Art',
    'screenprint': 'Screen',
    'embroidery': 'Emb',
    'dtg': 'DTG',
    'fulfillment': 'Fulfill',
    'complete': 'Done',
    // Printavo status names
    'new': 'New',
    'art_approval': 'Art',
    'artwork_approved': 'Approved',
    'payment_needed': 'Payment',
    'in_production': 'Production',
    'screen_print_production': 'Screen',
    'embroidery_production': 'Emb',
    'dtg_production': 'DTG',
    'ready': 'Ready',
    'ready_for_pickup': 'Pickup',
    'shipped': 'Shipped',
    'delivered': 'Done',
    'on_hold': 'Hold',
    'cancelled': 'Cancelled',
  };
  return labels[normalized] || status.replace(/_/g, ' ');
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
