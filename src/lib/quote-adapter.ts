/**
 * Quote to Order Adapter
 *
 * Transforms Quote API response to match OrderDetail shape
 * so OrderDetailPage can render quotes without modification.
 */

import type {
  OrderDetail,
  OrderDetailLineItem,
  OrderDetailCustomer,
  LineItemImprint,
  LineItemMockup
} from './hooks';

// Extended OrderDetail with quote-specific fields
export interface QuoteAsOrder extends OrderDetail {
  isQuote: true;
  quoteId: number;
  quoteStatus: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
}

// Map quote status to display-friendly status
function mapQuoteStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'QUOTE DRAFT',
    'sent': 'QUOTE SENT',
    'approved': 'QUOTE APPROVED',
    'rejected': 'QUOTE REJECTED',
    'converted': 'CONVERTED TO ORDER',
    'expired': 'QUOTE EXPIRED',
  };
  return statusMap[status?.toLowerCase()] || status?.toUpperCase() || 'QUOTE';
}

// Normalize sizes from Quote format (uppercase keys) to Order format (lowercase)
function normalizeSizes(sizes: Record<string, number> | null): OrderDetailLineItem['sizes'] {
  if (!sizes) {
    return {
      // Baby/Toddler
      '6m': 0, '12m': 0, '18m': 0, '24m': 0, '2t': 0, '3t': 0, '4t': 0, '5t': 0,
      // Youth
      yxs: 0, ys: 0, ym: 0, yl: 0, yxl: 0,
      // Adult
      xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0, xxxxxx: 0,
      // Other
      other: 0
    };
  }

  return {
    // Baby/Toddler
    '6m': sizes['6m'] || sizes['6M'] || 0,
    '12m': sizes['12m'] || sizes['12M'] || 0,
    '18m': sizes['18m'] || sizes['18M'] || 0,
    '24m': sizes['24m'] || sizes['24M'] || 0,
    '2t': sizes['2t'] || sizes['2T'] || 0,
    '3t': sizes['3t'] || sizes['3T'] || 0,
    '4t': sizes['4t'] || sizes['4T'] || 0,
    '5t': sizes['5t'] || sizes['5T'] || 0,
    // Youth
    yxs: sizes['yxs'] || sizes['YXS'] || 0,
    ys: sizes['ys'] || sizes['YS'] || 0,
    ym: sizes['ym'] || sizes['YM'] || 0,
    yl: sizes['yl'] || sizes['YL'] || 0,
    yxl: sizes['yxl'] || sizes['YXL'] || 0,
    // Adult
    xs: sizes['XS'] || sizes['xs'] || 0,
    s: sizes['S'] || sizes['s'] || 0,
    m: sizes['M'] || sizes['m'] || 0,
    l: sizes['L'] || sizes['l'] || 0,
    xl: sizes['XL'] || sizes['xl'] || 0,
    xxl: sizes['XXL'] || sizes['2XL'] || sizes['xxl'] || sizes['2xl'] || 0,
    xxxl: sizes['XXXL'] || sizes['3XL'] || sizes['xxxl'] || sizes['3xl'] || 0,
    xxxxl: sizes['XXXXL'] || sizes['4XL'] || sizes['xxxxl'] || sizes['4xl'] || 0,
    xxxxxl: sizes['XXXXXL'] || sizes['5XL'] || sizes['xxxxxl'] || sizes['5xl'] || 0,
    xxxxxx: sizes['XXXXXX'] || sizes['6XL'] || sizes['xxxxxx'] || sizes['6xl'] || 0,
    // Other
    other: sizes['other'] || sizes['Other'] || sizes['OTHER'] || 0,
  };
}

// Transform quote line item to order line item shape
function transformQuoteLineItem(item: any, index: number): OrderDetailLineItem {
  // Create imprints from quote data
  const imprints: LineItemImprint[] = [];

  // If quote has locations array, create imprint entries
  if (item.locations && Array.isArray(item.locations)) {
    item.locations.forEach((location: string, i: number) => {
      imprints.push({
        id: i + 1,
        location: location,
        decorationType: item.print_method || null,
        description: null,
        colorCount: item.colors || null,
        colors: null,
        width: null,
        height: null,
        hasUnderbase: null,
        stitchCount: null,
        mockups: [],
      });
    });
  } else if (item.print_method) {
    // Create a single imprint from print_method
    imprints.push({
      id: 1,
      location: 'Front',
      decorationType: item.print_method,
      description: null,
      colorCount: item.colors || null,
      colors: null,
      width: null,
      height: null,
      hasUnderbase: null,
      stitchCount: null,
      mockups: [],
    });
  }

  // Handle mockup
  let mockup: LineItemMockup | null = null;
  if (item.mockup_url) {
    mockup = {
      id: `mockup-${item.id || index}`,
      url: item.mockup_url,
      name: 'Mockup',
      thumbnail_url: item.mockup_thumbnail_url || null,
    };
  }

  return {
    id: item.id || index + 1,
    groupId: null,
    groupName: null,
    styleNumber: item.style_number || null,
    description: item.description || item.product_type || 'Line Item',
    color: item.color || null,
    category: item.product_type || null,
    unitCost: parseFloat(item.unit_price) || 0,
    totalQuantity: item.total_quantity || item.quantity || 0,
    totalCost: parseFloat(item.line_total) || 0,
    sizes: normalizeSizes(item.sizes),
    mockup,
    imprints,
  };
}

// Main transformer: Quote API response → OrderDetail shape
export function transformQuoteToOrder(quoteData: any): QuoteAsOrder {
  const quote = quoteData.quote || quoteData;
  const lineItems = quoteData.line_items || quote.line_items || [];

  // Build customer object
  const customer: OrderDetailCustomer = {
    id: quote.customer_id || 0,
    name: quote.customer_name || 'No Customer',
    email: quote.customer_email || null,
    phone: quote.customer_phone || null,
    company: quote.customer_company || null,
    city: quote.customer_city || null,
    state: quote.customer_state || null,
  };

  return {
    // Core order fields
    id: quote.id,
    orderNumber: quote.quote_number || `Q-${quote.id}`,
    orderNickname: quote.nickname || null,
    status: quote.status || 'draft',
    printavoStatusName: mapQuoteStatus(quote.status),
    totalAmount: parseFloat(quote.total) || 0,
    amountOutstanding: parseFloat(quote.total) || 0, // Quotes are unpaid
    salesTax: parseFloat(quote.tax_amount) || 0,
    dueDate: quote.expires_at || quote.due_date || null,
    customerDueDate: null,
    createdAt: quote.created_at || new Date().toISOString(),
    updatedAt: quote.updated_at || new Date().toISOString(),
    customer,
    customerPo: null,
    notes: quote.customer_notes || quote.notes || null,
    productionNotes: quote.internal_notes || null,
    artworkCount: quoteData.artwork?.length || 0,
    artworkFiles: (quoteData.artwork || []).map((art: any, i: number) => ({
      id: art.id || `art-${i}`,
      url: art.url || art.file_url || '',
      name: art.name || art.filename || `Artwork ${i + 1}`,
      source: 'quote',
      thumbnail_url: art.thumbnail_url || null,
    })),
    lineItems: lineItems.map(transformQuoteLineItem),

    // Quote-specific fields
    isQuote: true,
    quoteId: quote.id,
    quoteStatus: quote.status || 'draft',
    subtotal: parseFloat(quote.subtotal) || 0,
    discount: parseFloat(quote.discount) || parseFloat(quote.discount_amount) || 0,
    taxAmount: parseFloat(quote.tax_amount) || 0,
  };
}

// Type guard to check if an order is actually a quote
export function isQuoteOrder(order: OrderDetail | QuoteAsOrder): order is QuoteAsOrder {
  return 'isQuote' in order && order.isQuote === true;
}
