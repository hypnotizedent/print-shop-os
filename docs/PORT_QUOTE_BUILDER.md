# Quote Builder Porting Plan

> Created: December 22, 2025
> Source: `~/spark/print-shop-pro/`
> Target: `~/spark/ui-v3/`

---

## Summary

**Total Lines to Port:** ~6,500 lines across 15+ components
**Estimated Effort:** 2-3 days
**Priority:** High (enables full quote-to-order workflow)

---

## File Inventory

### Quote Components (2,528 lines)

| File | Lines | Priority | Notes |
|------|-------|----------|-------|
| `QuoteBuilder.tsx` | 633 | P1 | Main builder - CORE |
| `QuotesList.tsx` | 571 | P1 | List view - CORE |
| `QuoteCard.tsx` | 206 | P1 | Card component - CORE |
| `QuoteHistory.tsx` | 183 | P2 | Activity log |
| `QuoteTemplateManager.tsx` | 243 | P3 | Templates (defer) |
| `QuoteReminderScheduler.tsx` | 290 | P3 | Email scheduling (defer) |
| `QuoteReminderTemplate.tsx` | 402 | P3 | Email templates (defer) |
| `BulkQuoteReminders.tsx` | 325 | P3 | Bulk email (defer) |

### Required Dependencies (2,804 lines)

| File | Lines | Status in ui-v3 | Action |
|------|-------|-----------------|--------|
| `CustomerSearch.tsx` | 172 | Missing | PORT |
| `LineItemGrid.tsx` | 1,161 | Missing | PORT (or adapt LineItemsTable) |
| `PricingSummary.tsx` | 115 | Missing | PORT |
| `StatusBadge.tsx` | 141 | Exists (different) | COMPARE/MERGE |
| `PaymentTracker.tsx` | 284 | Missing | PORT (P2) |
| `PaymentReminders.tsx` | 476 | Missing | PORT (P2) |
| `StatusFilterPills.tsx` | ~100 | Missing | PORT |

### UI Components (Already in ui-v3)

| Component | Status |
|-----------|--------|
| Button, Input, Textarea | ✅ Ready |
| Card, Badge, Separator | ✅ Ready |
| Dialog, DropdownMenu | ✅ Ready |
| Tabs, Select, Checkbox | ✅ Ready |
| Popover | ✅ Ready |

### Types & Helpers

| Item | Location | Action |
|------|----------|--------|
| `Quote` interface | `types.ts:173` | ADD to ui-v3 types |
| `QuoteStatus` type | `types.ts:1` | ADD to ui-v3 types |
| `QuoteTemplate` interface | `types.ts:36` | ADD (P3) |
| `createEmptyQuote()` | `data.ts:99` | ADD to helpers |
| `calculateQuoteTotals()` | `data.ts:147` | ADD to helpers |
| `generateQuoteNumber()` | `data.ts:128` | ADD to helpers |

---

## Phased Implementation

### Phase 1: Core Quote Builder (Day 1)

**Goal:** Create new quote, edit line items, save

#### Files to Create

```
src/
├── components/
│   └── quotes/
│       ├── QuoteBuilder.tsx       ← Port from PrintShopPro
│       ├── CustomerSearch.tsx     ← Port from PrintShopPro
│       ├── LineItemGrid.tsx       ← Port (or adapt existing)
│       └── PricingSummary.tsx     ← Port from PrintShopPro
├── lib/
│   ├── types.ts                   ← ADD Quote, QuoteStatus
│   └── quote-helpers.ts           ← NEW: createEmptyQuote, calculate, etc.
└── App.tsx                        ← Add Quotes nav + routing
```

#### Tasks

- [ ] Add `Quote` and `QuoteStatus` types to `types.ts`
- [ ] Create `quote-helpers.ts` with factory/calculator functions
- [ ] Port `CustomerSearch.tsx` (172 lines)
- [ ] Port or adapt `LineItemGrid.tsx` (1,161 lines)
- [ ] Port `PricingSummary.tsx` (115 lines)
- [ ] Port `QuoteBuilder.tsx` (633 lines)
- [ ] Add "Quotes" nav item to sidebar
- [ ] Wire "New Order" button to create new quote
- [ ] Create `useQuote` hook for API integration

#### API Integration

```typescript
// NEW: src/lib/hooks.ts additions

export function useQuote(quoteId: string | null) {
  // GET /api/quotes/:id
}

export function useQuotes(options?: { limit?: number; status?: string }) {
  // GET /api/quotes
}

export function useQuoteMutation() {
  // POST /api/quotes (create)
  // PUT /api/quotes/:id (update)
  // DELETE /api/quotes/:id (delete)
}
```

#### Routing Changes

```typescript
// App.tsx - Add to View type
type View = 'dashboard' | 'orders' | 'order-detail' | 'customers' | 'customer-detail'
          | 'quotes' | 'quote-builder'  // NEW

// Add state
const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

// Add to renderView()
case 'quotes':
  return <QuotesList onSelectQuote={...} onNewQuote={...} />;
case 'quote-builder':
  return <QuoteBuilder quoteId={selectedQuoteId} onSave={...} onBack={...} />;
```

#### Nav Item

```tsx
// App.tsx sidebar - Add after Orders
<Button
  variant={currentView === 'quotes' || currentView === 'quote-builder' ? 'secondary' : 'ghost'}
  onClick={() => { setCurrentView('quotes'); setSelectedQuoteId(null); }}
>
  <FileText weight="bold" className="w-4 h-4" />
  Quotes
</Button>
```

---

### Phase 2: Quote List View (Day 1-2)

**Goal:** View all quotes, filter by status, bulk actions

#### Files to Create

```
src/components/quotes/
├── QuotesList.tsx         ← Port from PrintShopPro
├── QuoteCard.tsx          ← Port from PrintShopPro
└── StatusFilterPills.tsx  ← Port from PrintShopPro
```

#### Tasks

- [ ] Port `QuotesList.tsx` (571 lines)
- [ ] Port `QuoteCard.tsx` (206 lines)
- [ ] Port `StatusFilterPills.tsx` (~100 lines)
- [ ] Wire to `GET /api/quotes` endpoint
- [ ] Implement status filtering
- [ ] Implement search
- [ ] Add bulk selection UI

#### API Integration

```typescript
// Replace props-based filtering with API calls
const { quotes, loading, error } = useQuotes({
  limit: 50,
  offset: page * 50,
  status: statusFilter !== 'all' ? statusFilter : undefined,
  search: searchQuery || undefined,
});
```

---

### Phase 3: Quote Actions (Day 2)

**Goal:** Status changes, convert to order, payments

#### Files to Create/Modify

```
src/components/quotes/
├── QuoteHistory.tsx       ← Port from PrintShopPro (P2)
├── PaymentTracker.tsx     ← Port from PrintShopPro (P2)
└── PaymentReminders.tsx   ← Port from PrintShopPro (P2)
```

#### Tasks

- [ ] Port `QuoteHistory.tsx` (183 lines)
- [ ] Implement status change via API (`PUT /api/quotes/:id/status`)
- [ ] Implement "Convert to Order" (`POST /api/quotes/:id/convert`)
- [ ] Port payment tracking (P2)

#### API Integration

```typescript
// Status change
const changeStatus = async (quoteId: string, status: QuoteStatus) => {
  await fetch(`/api/quotes/${quoteId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

// Convert to order
const convertToOrder = async (quoteId: string) => {
  const response = await fetch(`/api/quotes/${quoteId}/convert`, {
    method: 'POST'
  });
  const { orderId } = await response.json();
  // Navigate to order detail
  setSelectedOrderId(orderId);
  setCurrentView('order-detail');
};
```

---

### Phase 4: Enhancements (Day 3, Optional)

**Goal:** Templates, reminders, bulk operations

#### Files to Create

```
src/components/quotes/
├── QuoteTemplateManager.tsx     ← Port (P3)
├── QuoteReminderScheduler.tsx   ← Port (P3)
└── BulkQuoteReminders.tsx       ← Port (P3)
```

#### Tasks (Defer to v2.3.0+)

- [ ] Quote templates (save/load common configurations)
- [ ] Email reminder scheduling
- [ ] Bulk status changes
- [ ] Invoice PDF generation
- [ ] Email sending integration

---

## API Requirements

### Endpoints Needed

| Method | Endpoint | Purpose | Phase |
|--------|----------|---------|-------|
| `GET` | `/api/quotes` | List quotes | P1 |
| `GET` | `/api/quotes/:id` | Get single quote | P1 |
| `POST` | `/api/quotes` | Create quote | P1 |
| `PUT` | `/api/quotes/:id` | Update quote | P1 |
| `DELETE` | `/api/quotes/:id` | Delete quote | P2 |
| `PUT` | `/api/quotes/:id/status` | Change status | P2 |
| `POST` | `/api/quotes/:id/convert` | Convert to order | P2 |
| `POST` | `/api/quotes/:id/line-items` | Add line item | P1 |
| `PUT` | `/api/quotes/:id/line-items/:itemId` | Update line item | P1 |
| `DELETE` | `/api/quotes/:id/line-items/:itemId` | Delete line item | P1 |

### Response Formats

```typescript
// GET /api/quotes
interface QuotesListResponse {
  quotes: QuoteSummary[];
  total: number;
  pagination: { page: number; limit: number; totalPages: number };
}

// GET /api/quotes/:id
interface QuoteDetailResponse {
  id: string;
  quote_number: string;
  status: QuoteStatus;
  customer: Customer;
  line_items: LineItem[];
  subtotal: number;
  discount: number;
  discount_type: 'percent' | 'fixed';
  total: number;
  due_date: string | null;
  notes_customer: string | null;
  notes_internal: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Type Definitions to Add

```typescript
// Add to src/lib/types.ts

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface Quote {
  id: string;
  quote_number: string;
  status: QuoteStatus;
  customer: {
    id: string;
    name: string;
    email?: string;
    company?: string;
  };
  line_items: QuoteLineItem[];
  subtotal: number;
  discount: number;
  discount_type: 'percent' | 'fixed';
  total: number;
  due_date: string | null;
  notes_customer: string | null;
  notes_internal: string | null;
  nickname?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: string;
  product_name: string;
  product_sku?: string;
  product_color?: string;
  sizes: SizeBreakdown;
  quantity: number;
  unit_price: number;
  subtotal: number;
  decorations?: QuoteDecoration[];
}

export interface QuoteDecoration {
  id: string;
  method: 'screen-print' | 'dtg' | 'embroidery' | 'vinyl';
  location: string;
  colors?: string;
  setup_fee: number;
}
```

---

## Helper Functions to Add

```typescript
// NEW: src/lib/quote-helpers.ts

export function generateQuoteNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `Q-${timestamp}${random}`;
}

export function createEmptyQuote(customer?: Partial<Customer>): Quote {
  return {
    id: crypto.randomUUID(),
    quote_number: generateQuoteNumber(),
    status: 'draft',
    customer: {
      id: customer?.id || '',
      name: customer?.name || '',
      email: customer?.email,
      company: customer?.company,
    },
    line_items: [],
    subtotal: 0,
    discount: 0,
    discount_type: 'percent',
    total: 0,
    due_date: null,
    notes_customer: null,
    notes_internal: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function calculateQuoteTotals(quote: Quote): Quote {
  const subtotal = quote.line_items.reduce((sum, item) => sum + item.subtotal, 0);

  let discountAmount = 0;
  if (quote.discount_type === 'percent') {
    discountAmount = subtotal * (quote.discount / 100);
  } else {
    discountAmount = quote.discount;
  }

  const total = Math.max(0, subtotal - discountAmount);

  return {
    ...quote,
    subtotal,
    total,
    updated_at: new Date().toISOString(),
  };
}
```

---

## Adaptation Notes

### PrintShopPro → ui-v3 Differences

| Aspect | PrintShopPro | ui-v3 | Adaptation |
|--------|--------------|-------|------------|
| Data source | Props (mock data) | API hooks | Replace props with `useQuote()` |
| Save | `onSave(quote)` prop | API mutation | Use `useQuoteMutation().save()` |
| Customer data | Props | API | Use `useCustomers()` for search |
| Line items | Local state | API | Use `useQuoteMutation().addLineItem()` |
| Status badge | Custom component | Exists | Compare, may need merge |
| Navigation | `onBack()` prop | Router state | Use `setCurrentView()` |

### Key Code Changes

**QuoteBuilder.tsx - Data fetching:**
```typescript
// BEFORE (PrintShopPro)
export function QuoteBuilder({ quote: initialQuote, customers, ... }: Props) {
  const [quote, setQuote] = useState(initialQuote);

// AFTER (ui-v3)
export function QuoteBuilder({ quoteId }: { quoteId: string | null }) {
  const { quote, loading, error } = useQuote(quoteId);
  const { save, addLineItem } = useQuoteMutation(quoteId);
```

**QuotesList.tsx - Data fetching:**
```typescript
// BEFORE (PrintShopPro)
export function QuotesList({ quotes, ... }: Props) {
  const filteredQuotes = quotes.filter(...);

// AFTER (ui-v3)
export function QuotesList({ ... }) {
  const { quotes, total, loading } = useQuotes({
    status: statusFilter,
    search: searchQuery,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });
```

---

## File Structure After Porting

```
src/
├── components/
│   ├── quotes/                    # NEW FOLDER
│   │   ├── QuoteBuilder.tsx       # 633 lines (adapted)
│   │   ├── QuotesList.tsx         # 571 lines (adapted)
│   │   ├── QuoteCard.tsx          # 206 lines
│   │   ├── QuoteHistory.tsx       # 183 lines (P2)
│   │   ├── CustomerSearch.tsx     # 172 lines
│   │   ├── LineItemGrid.tsx       # 1,161 lines (or adapt existing)
│   │   ├── PricingSummary.tsx     # 115 lines
│   │   └── StatusFilterPills.tsx  # ~100 lines
│   ├── orders/                    # Existing
│   ├── customers/                 # Existing
│   ├── shared/                    # Existing
│   └── ui/                        # Existing
├── lib/
│   ├── types.ts                   # ADD Quote types
│   ├── quote-helpers.ts           # NEW
│   ├── hooks.ts                   # ADD useQuote, useQuotes, useQuoteMutation
│   └── api-adapter.ts             # ADD quote API functions
└── App.tsx                        # ADD quotes view + routing
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Can create new quote from "New Order" button
- [ ] Can search/select customer
- [ ] Can add line items with sizes
- [ ] Can save quote to API
- [ ] "Quotes" nav item visible and working

### Phase 2 Complete When:
- [ ] Can view list of all quotes
- [ ] Can filter by status
- [ ] Can search quotes
- [ ] Can click quote to edit

### Phase 3 Complete When:
- [ ] Can change quote status
- [ ] Can convert approved quote to order
- [ ] Quote history shows activity

### Full Port Complete When:
- [ ] All P1 and P2 features working
- [ ] No console errors
- [ ] All API calls functioning
- [ ] Can complete full quote-to-order workflow

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API endpoints don't exist | Create stubs, work with backend team |
| LineItemGrid too complex | Start with simplified version, iterate |
| Type mismatches | Create adapter functions |
| Missing UI components | Port minimal versions first |

---

## Next Steps

1. **Verify API readiness** - Check if quote endpoints exist
2. **Create types first** - Add Quote types to types.ts
3. **Port CustomerSearch** - Needed for quote creation
4. **Port QuoteBuilder shell** - Basic structure without full features
5. **Wire to API** - Connect to real endpoints
6. **Iterate** - Add features incrementally
