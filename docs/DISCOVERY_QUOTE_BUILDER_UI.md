# Quote Builder UI Discovery

> Discovered: December 22, 2025
> Source: PrintShopPro (`~/spark/print-shop-pro/`)

---

## Summary

**PrintShopPro has a FULL-FEATURED Quote Builder system** with 8 dedicated components. ui-v3 has NONE of this functionality - only a "New Order" button that does nothing.

---

## PrintShopPro Quote Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| `QuoteBuilder.tsx` | 634 | Full quote creation/editing page |
| `QuotesList.tsx` | 572 | List view with filters, bulk actions |
| `QuoteCard.tsx` | 207 | Card display for list items |
| `QuoteHistory.tsx` | ? | Activity log for quotes |
| `QuoteTemplateManager.tsx` | ? | Saved quote templates |
| `QuoteReminderScheduler.tsx` | ? | Schedule reminder emails |
| `QuoteReminderTemplate.tsx` | ? | Email reminder templates |
| `BulkQuoteReminders.tsx` | ? | Send reminders to multiple quotes |

---

## QuoteBuilder Features (634 lines)

### Layout
```
┌────────────────────────────────────────────────────────────────────────────┐
│ ← Back    Quote Q-1234    [DRAFT]                 [More Actions ▼] [Save] │
│           Saved 2 min ago                                      [Send Quote]│
├────────────────────────────────────────────────────────────────────────────┤
│ CUSTOMER                          │ QUOTE NICKNAME                         │
│ [Search or create customer...]    │ [e.g., Summer Promo, Church Event...] │
├────────────────────────────────────────────────────────────────────────────┤
│ PRODUCT TEMPLATES (if any)                                                 │
│ [Template 1] [Template 2] [Template 3]                                     │
├────────────────────────────────────────────────────────────────────────────┤
│ FAVORITE PRODUCTS (if any)                                                 │
│ [Fav 1] [Fav 2] [Fav 3] [+]                                               │
├────────────────────────────────────────────────────────────────────────────┤
│ LINE ITEMS                                      [+ Add Imprint] [+ Add LI] │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ Line Item Grid (expandable, editable)                                  │ │
│ │ - Product name, SKU, color                                             │ │
│ │ - Size breakdown grid                                                   │ │
│ │ - Decoration locations with mockups                                    │ │
│ │ - Unit price, quantity, total                                          │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────┤
│ DETAILS                           │ PRICING                                │
│ Due Date: [date picker]           │ ┌──────────────────────────────────┐  │
│ Customer Notes: [textarea]        │ │ Subtotal        $1,234.56        │  │
│ Internal Notes: [textarea]        │ │ Discount        [10] [% ▼]       │  │
│                                   │ │ Total           $1,111.10        │  │
│                                   │ └──────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────┤
│ [History] [Payments] [Messages]                  Subtotal: $X  Total: $Y  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Key Features

1. **Customer Selection**
   - `CustomerSearch` component with typeahead
   - "Create New Customer" inline option
   - Auto-saves customer to quote

2. **Product Templates & Favorites**
   - Quick-add from saved product templates
   - Favorite products for frequent items
   - One-click to add to quote

3. **Line Item Management**
   - `LineItemGrid` component for editing
   - Add/remove line items
   - Add imprints to line items
   - Size grid with quantity editing

4. **Pricing**
   - `PricingSummary` component
   - Discount (% or fixed)
   - `PricingRulesSuggestions` - auto-suggest discounts based on customer rules
   - Auto-calculate totals

5. **Keyboard Shortcuts**
   - `⌘+S` - Save quote
   - `⌘+N` - Add line item
   - `Esc` - Close quote builder

6. **Auto-Save**
   - Saves every 30 seconds if customer selected
   - Shows "Saved X min ago" indicator

7. **Actions Menu**
   - View Customer Profile
   - Duplicate Quote
   - Print Quote Labels
   - Create Shipping Label

8. **Dialogs**
   - History (QuoteHistory component)
   - Payments (PaymentTracker + PaymentReminders)
   - Messages (QuoteReminderScheduler)

### Quote Statuses

```typescript
type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
```

---

## QuotesList Features (572 lines)

### Layout
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Quotes                                    [Bulk Reminders] [+ New Quote]   │
│ 45 quotes • 12 need action                                                 │
├────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Search quotes...                              ][Clear][Filter ▼][Save] │
│                                                                            │
│ [All] [Draft (5)] [Sent (12)] [Approved (20)] [Rejected (3)] [Expired (5)]│
├────────────────────────────────────────────────────────────────────────────┤
│ ☑ 3 quotes selected                                                        │
│ [Change Status ▼] [Send Invoices] [Export as ZIP] [Delete] [Cancel]       │
├────────────────────────────────────────────────────────────────────────────┤
│ NEEDS ACTION (12)                                                          │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ☐ Q-1234 [DRAFT] Summer Promo                              $1,234.56 │  │
│ │   ABC Company                                                 3 items │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ RECENTLY SENT (10)                                                         │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ ☐ Q-1233 [SENT] Church Event          [Invoice ▼] [Convert to Job]   │  │
│ │   First Baptist Church                 $567.89            5 items    │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Key Features

1. **Search & Filter**
   - Search by quote number, nickname, customer
   - Status filter (dropdown + pills)
   - Date sort (newest/oldest)
   - Recent searches dropdown
   - Filter presets (save/load)

2. **Bulk Actions**
   - Select multiple quotes
   - Change status in bulk
   - Send invoices (approved quotes)
   - Export as ZIP (approved quotes)
   - Delete quotes

3. **Status Pills**
   - `StatusFilterPills` component
   - Shows count per status
   - Click to filter

4. **Quote Card Actions**
   - Click status badge → dropdown to change
   - "Invoice" dropdown (Download PDF, Send to Customer)
   - "Convert to Job" button (approved quotes)

5. **Grouping**
   - "Needs Action" section (draft, sent, approved)
   - "Recently Sent" section

---

## QuoteCard Features (207 lines)

### Display
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ☐ Q-1234 [DRAFT ▼]                                           $1,234.56 │
│   Summer Promo                                                  3 items │
│   ABC Company                                                           │
│   [img][img][img] +2                                                    │
│   Sent 2 days ago                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Features
- Checkbox for bulk selection
- Quote number
- Status badge (clickable dropdown to change)
- Nickname
- Customer name/company
- Artwork thumbnails (max 3, +N overflow)
- Total amount
- Item count
- Relative timestamp

### Actions (Approved Quotes)
- Invoice dropdown: Send to Customer, Download PDF
- "Convert to Job" button

---

## Navigation in PrintShopPro

`App.tsx` line 812:
```typescript
{ id: 'quotes' as const, label: 'Quotes', icon: FileText }
```

Quotes is a **top-level navigation item** in the sidebar.

### Routes
- `quotes` → QuotesList
- `quote-builder` → QuoteBuilder (with quote data)

---

## ui-v3 Current State

### Navigation (App.tsx)

```tsx
// Line 233: Orders
<Button variant={...} onClick={() => setCurrentView('orders')}>
  <Package weight="bold" /> Orders
</Button>

// NO QUOTES NAV ITEM!
```

### "New Order" Button (Line 329-334)

```tsx
<Button variant="default" size="sm" className="gap-2 h-8">
  <svg>...</svg>
  New Order
</Button>
// No onClick handler!
```

### Quote References

Only 2 mentions of "quote" in ui-v3:
1. Line 16: Status mapping `'quote': 'QUOTE'`
2. Line 322: Search placeholder text

**No quote functionality exists in ui-v3.**

---

## Portability Assessment

### Can We Port QuoteBuilder?

| Aspect | PrintShopPro | ui-v3 | Effort |
|--------|--------------|-------|--------|
| Component library | shadcn/ui | shadcn/ui | ✅ Compatible |
| Icons | Phosphor | Phosphor | ✅ Compatible |
| State management | useState + useKV | useState + useKV | ✅ Compatible |
| Toast notifications | sonner | sonner | ✅ Compatible |
| Types | Local types.ts | Local types.ts | 🔄 Need mapping |
| API calls | Props-based (no API) | Hooks with real API | ⚠️ Need adaptation |
| Customer search | CustomerSearch component | None | 🆕 Need to port |
| Line item grid | LineItemGrid component | LineItemsTable exists | 🔄 Similar pattern |

### Dependencies to Port

1. **Components**
   - `CustomerSearch` - typeahead with create
   - `LineItemGrid` - line item editing
   - `PricingSummary` - totals + discount
   - `StatusBadge` - already exists in ui-v3
   - `QuoteCard` - for list view
   - `StatusFilterPills` - status quick filters

2. **Helpers**
   - `createEmptyQuote()` - new quote factory
   - `calculateQuoteTotals()` - totals calculator
   - `generateQuoteNumber()` - Q-XXXXX generator
   - `exportInvoiceAsPDF()` - PDF generation
   - `sendInvoiceEmail()` - email integration

3. **Types**
   - `Quote` interface
   - `QuoteStatus` type
   - `LineItem` with decorations
   - `Payment` interface

### Estimated Effort

| Task | Effort |
|------|--------|
| Port QuoteBuilder.tsx | 2-3 hours |
| Port QuotesList.tsx | 2 hours |
| Port QuoteCard.tsx | 1 hour |
| Port CustomerSearch.tsx | 1-2 hours |
| Port supporting components | 2-3 hours |
| Wire to real API | 4-6 hours |
| **Total** | **~15 hours** |

---

## Recommendations

### Option A: Full Port (Recommended)

Port entire quote system from PrintShopPro:
1. Copy all 8 quote components
2. Adapt types to match API
3. Add "Quotes" nav item
4. Wire to API endpoints

**Pros:** Full-featured, proven UI
**Cons:** Significant effort

### Option B: Minimal Quote Modal

Create simplified "New Order" modal:
1. Customer search/select
2. Basic line item entry
3. Submit → creates order via API

**Pros:** Quick to implement
**Cons:** Missing bulk actions, history, reminders

### Option C: Route to External Quote Builder

If PrintShopPro is deployed:
1. "New Quote" opens PrintShopPro in new tab
2. Sync quotes via API

**Pros:** Zero frontend work
**Cons:** Separate app, context switching

---

## API Requirements

For quotes to work, API needs:

```
Quotes CRUD:
GET    /api/quotes           - List quotes
GET    /api/quotes/:id       - Get single quote
POST   /api/quotes           - Create quote
PUT    /api/quotes/:id       - Update quote
DELETE /api/quotes/:id       - Delete quote

Quote Actions:
PUT    /api/quotes/:id/status         - Change status
POST   /api/quotes/:id/send           - Send to customer
POST   /api/quotes/:id/convert-to-job - Convert to order/job

Line Items (if managed separately):
POST   /api/quotes/:id/line-items
PUT    /api/quotes/:id/line-items/:itemId
DELETE /api/quotes/:id/line-items/:itemId
```

---

## Files Reference

### PrintShopPro Quote Files

```
~/spark/print-shop-pro/src/components/
├── QuoteBuilder.tsx          (634 lines) - Main builder
├── QuotesList.tsx            (572 lines) - List view
├── QuoteCard.tsx             (207 lines) - Card component
├── QuoteHistory.tsx          - Activity log
├── QuoteTemplateManager.tsx  - Templates
├── QuoteReminderScheduler.tsx - Email scheduling
├── QuoteReminderTemplate.tsx - Email templates
└── BulkQuoteReminders.tsx    - Bulk email

~/spark/print-shop-pro/src/lib/
├── types.ts                  - Quote, QuoteStatus types
├── data.ts                   - createEmptyQuote, calculateQuoteTotals
├── invoice-generator.ts      - PDF export
└── invoice-email.ts          - Email integration
```

### ui-v3 (No Quote Files)

```
~/spark/ui-v3/src/
├── components/orders/        - Order components only
├── lib/types.ts              - No Quote type
└── App.tsx                   - No Quotes nav
```

---

## Conclusion

PrintShopPro has a **mature, full-featured Quote Builder** with:
- Full quote lifecycle (draft → sent → approved → job)
- Bulk actions and status management
- Payment tracking and reminders
- Email integration
- PDF invoice generation

ui-v3 has **zero quote functionality** - the "New Order" button doesn't even have an onClick handler.

**Recommendation:** Port the QuoteBuilder and QuotesList components to ui-v3, adapting them to use the real API instead of props-based state. This gives users a complete quote-to-order workflow.
