# Order Card UI Diagnostic

> Audited: December 22, 2025
> File: `src/components/dashboard/Dashboard.tsx`

---

## Current Card Layout

```
┌─────────────────────────────────────────────────────────────┐
│ #13708 · Tend Minty Fresh Crewneck Sweatshirts    1 items   │
│ Jonathan Lieberman                                          │
│ PTP Universal                                               │
│ 📅 Due Dec 19, 2025 (-3d overdue)  $ $207.23               │
└─────────────────────────────────────────────────────────────┘
```

---

## Element Mapping

| UI Element | Line | Code | Source Field | Issue |
|------------|------|------|--------------|-------|
| `#13708` | 104 | `#{order.visual_id}` | `visual_id` | ✅ OK |
| Job name | 105 | `{order.nickname}` | `order_nickname` | ✅ OK |
| Customer name | 108 | `{order.customer_name}` | `customer_name` | ✅ OK |
| Company | 109-111 | `{order.customer_company}` | `customer_company` | ✅ OK (shows if different) |
| Calendar icon | 114 | `<CalendarBlank />` | - | ⚠️ Could remove |
| Due date | 116 | `formatDate(order.due_date)` | `due_date` | ⚠️ NaN if empty |
| Days calc | 116 | `${daysUntilDue}d` | calculated | ⚠️ NaN if empty |
| Price | 119 | `$ {formatCurrency(order.total)}` | `total` | ❌ DOUBLE $ |
| Items | 124 | `{order.line_items_count ?? ...}` | `line_items.length` | ❌ Wrong metric |

---

## Issues Found

### 1. Double Dollar Sign (Line 119)

**Code:**
```tsx
<span>$ {formatCurrency(order.total)}</span>
```

**Problem:** `formatCurrency()` uses `Intl.NumberFormat` with `style: 'currency'` which already includes the `$` symbol.

**Result:** Shows `$ $207.23` instead of `$207.23`

**Fix:** Remove the extra `$`:
```tsx
<span>{formatCurrency(order.total)}</span>
```

---

### 2. Items Count Shows Line Items, Not Pieces (Line 124)

**Code:**
```tsx
{order.line_items_count ?? order.line_items?.length ?? 0} items
```

**Problem:** Shows number of line items (1), not total pieces across all items.

**API provides:**
```json
{
  "line_items": [{
    "total_quantity": 20
  }]
}
```

**Current:** Shows `1 items` (1 line item)
**Should show:** `20 pcs` (sum of total_quantity)

**Fix options:**
1. Sum `line_items[].total_quantity` in adapter
2. Add `total_pieces` field to API response
3. Calculate in component: `order.line_items?.reduce((sum, li) => sum + li.quantity, 0)`

---

### 3. Date NaN Issue (Lines 90-92, 116)

**Code:**
```tsx
const dueDate = new Date(order.due_date);
const isOverdue = dueDate < now;
const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
// ...
Due {formatDate(order.due_date)} ({isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d`})
```

**Problem:** If `order.due_date` is empty string `""` or `null`:
- `new Date("")` creates Invalid Date
- `dueDate.getTime()` returns NaN
- `daysUntilDue` becomes NaN
- UI shows `Due Invalid Date (NaNd)`

**Fix:** Add null check:
```tsx
{order.due_date && (
  <div className="flex items-center gap-1">
    <CalendarBlank className="w-3 h-3" />
    <span>
      Due {formatDate(order.due_date)} ({isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d`})
    </span>
  </div>
)}
```

---

## Data Flow

### API Response → Adapter → Component

```
API: /api/orders
├── visual_id: "13708"
├── order_nickname: "Tend Minty Fresh..."
├── customer_name: "Jonathan Lieberman"
├── customer_company: "PTP Universal"
├── due_date: "2025-12-19T00:00:00.000Z"
├── total_amount: "207.23"
└── line_items: [{ total_quantity: 20 }]
        │
        ▼
Adapter: transformOrder()
├── visual_id: "13708"
├── nickname: "Tend Minty Fresh..."
├── customer_name: "Jonathan Lieberman"
├── customer_company: "PTP Universal"
├── due_date: "2025-12-19T00:00:00.000Z"
├── total: 207.23 (parsed float)
├── line_items_count: 1 (array length)
└── line_items: [{ quantity: 20 }]
        │
        ▼
Dashboard.tsx renders order card
```

---

## Type Definitions

### Order (from types.ts)

```typescript
interface Order {
  id: string;
  visual_id: string;
  customer_id: string;
  customer_name: string;
  customer_company?: string;
  line_items_count?: number;
  status: OrderStatus;
  line_items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  due_date: string;
  created_at: string;
  production_notes: string;
  nickname?: string;
}
```

### LineItem (from types.ts)

```typescript
interface LineItem {
  id: string;
  order_id: string;
  product_name: string;
  product_sku: string;
  product_color: string;
  sizes: SizeBreakdown;
  quantity: number;  // Total pieces for this line item
  unit_price: number;
  subtotal: number;
  imprints: Imprint[];
  mockups: Mockup[];
  production_files: ProductionFile[];
}
```

---

## Recommended Fixes

### Priority 1: Double $ (Easy)
- Line 119: Remove extra `$`

### Priority 2: Items → Pieces (Medium)
- Add `total_pieces` to Order type
- Calculate in adapter: `sum(line_items[].total_quantity)`
- Update display: `{order.total_pieces} pcs`

### Priority 3: Date NaN (Medium)
- Add null check around date display
- Show "No due date" fallback

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/Dashboard.tsx` | Fix double $, add date null check |
| `src/lib/api-adapter.ts` | Add `total_pieces` calculation |
| `src/lib/types.ts` | Add `total_pieces?: number` to Order |
