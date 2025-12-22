# Customers Page UI Diagnostic

> Audited: December 22, 2025
> File: `src/components/customers/CustomersListPage.tsx`

---

## Current Card Layout

```
CURRENT (broken):
┌────────────────────────────────────────────────────────────────┐
│ Unknown [SILVER]                    Revenue  Orders  Last Order│
│ Kaos Carnival                       $2877.90    0    19hrs ago │
└────────────────────────────────────────────────────────────────┘

EXPECTED (after fix):
┌────────────────────────────────────────────────────────────────┐
│ Kaos Carnival [SILVER]              Revenue  Orders  Last Order│
│ akeimbanton@gmail.com               $2877.90    5    19hrs ago │
└────────────────────────────────────────────────────────────────┘
```

---

## Issues Found

### 1. Customer Name Shows "Unknown" (API Issue)

**API Response:**
```json
{
  "id": 3831,
  "name": null,              // ← Always null!
  "company": "Kaos Carnival",
  "email": "akeimbanton@gmail.com"
}
```

**Root Cause:** API query doesn't construct `name` from `first_name` + `last_name`

**UI Code (hooks.ts:585):**
```typescript
name: c.name || 'Unknown',  // Falls back to 'Unknown'
```

**Fix Required (API):**
```sql
-- In customers query, construct name:
CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) as name
-- Or fallback to company if both are null
```

**Fix Required (UI - Temporary):**
```typescript
name: c.name || c.company || 'Unknown',  // Fallback to company
```

---

### 2. Orders Count Shows 0 (API Issue)

**API Response:**
```json
{
  "orders_count": null       // ← Always null!
}
```

**UI Code (hooks.ts:605):**
```typescript
orders_count: c.orders_count || 0,  // Falls back to 0
```

**Fix Required (API):**
```sql
-- In customers query, add orders count:
(SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) as orders_count
```

---

### 3. Search Endpoint Returns Incomplete Data

**Regular List Endpoint (`/api/customers?limit=5`):**
```json
{
  "id": 3831,
  "name": null,
  "email": "...",
  "company": "...",
  "total_revenue": "2877.90",
  "orders_count": null,
  "last_order_date": "2025-12-21T...",
  "tier": "silver"
}
```

**Search Endpoint (`/api/customers/search?q=kaos`):**
```json
{
  "id": 3831,
  "name": null,
  "email": "...",
  "company": "...",
  "city": null,
  "state": null
  // ← Missing: total_revenue, orders_count, last_order_date, tier
}
```

**Impact:** After searching, customer cards will show:
- Revenue: $0.00 (missing)
- Orders: 0 (missing)
- Last Order: Never (missing)
- Tier: bronze (default, missing)

**Fix Required (API):** Search endpoint needs same JOINs/aggregates as list endpoint

---

## Data Flow Trace

```
API: /api/customers
│
├── name: null                    ← Bug: Not constructed from first_name/last_name
├── company: "Kaos Carnival"      ← OK
├── orders_count: null            ← Bug: Not calculated
├── total_revenue: "2877.90"      ← OK (string)
├── last_order_date: "2025-..."   ← OK
├── tier: "silver"                ← OK
│
▼
hooks.ts: useCustomersList()
│
├── name: 'Unknown'               ← Fallback triggered
├── company: "Kaos Carnival"      ← Passed through
├── orders_count: 0               ← Fallback triggered
├── total_revenue: 2877.90        ← Parsed to number
├── last_order_date: "2025-..."   ← Passed through
├── tier: "silver"                ← Passed through
│
▼
CustomersListPage.tsx renders customer card
```

---

## Field Mapping Investigation

| UI Shows | Expected Source | API Returns | Issue |
|----------|-----------------|-------------|-------|
| "Unknown" | `name` (first + last) | `null` | **API BUG** |
| Company | `company` | `"Kaos Carnival"` | ✅ OK |
| Tier badge | `tier` | `"silver"` | ✅ OK |
| Revenue | `total_revenue` | `"2877.90"` | ✅ OK |
| Orders | `orders_count` | `null` | **API BUG** |
| Last Order | `last_order_date` | `"2025-..."` | ✅ OK |

---

## Search Implementation

**How it works:**
```typescript
// CustomersListPage.tsx line 45-49
const { customers, total, loading, error, refetch } = useCustomersList({
  limit: PAGE_SIZE,
  offset: searchQuery ? undefined : offset,
  search: searchQuery || undefined,
});

// hooks.ts line 566-575
if (options?.search && options.search.trim()) {
  // Uses search endpoint - returns minimal data!
  url = `${API_BASE_URL}/api/customers/search?q=${encodeURIComponent(options.search)}`
} else {
  // Uses list endpoint with pagination
  url = `${API_BASE_URL}/api/customers?${params}`
}
```

**Search is server-side** - Calls `/api/customers/search?q=`

**Fields searched (API side):** Unknown - need to check API code

---

## Reference: PrintShopPro Pattern

**From print-shop-pro/src/components/CustomersList.tsx:**
```tsx
// Line 388-439
<div className="font-semibold text-lg">{customer.name}</div>
{customer.tier && <Badge>{customer.tier}</Badge>}

<div className="flex gap-4 mt-2 text-sm text-muted-foreground">
  {customer.company && (
    <div className="flex items-center gap-1">
      <Buildings size={16} />
      {customer.company}
    </div>
  )}
  <div className="flex items-center gap-1">
    <EnvelopeSimple size={16} />
    {customer.email}
  </div>
  {customer.phone && (
    <div className="flex items-center gap-1">
      <Phone size={16} />
      {customer.phone}
    </div>
  )}
</div>

// Stats section
<div>Total Revenue: {formatCurrency(customer.totalRevenue)}</div>
<div>Last Order: {formatDate(customer.mostRecentOrder)}</div>
<div>Orders: {customer.orderCount}</div>
```

**Key Difference:** PrintShopPro calculates stats client-side from quotes/jobs arrays

---

## Recommended Fixes

### Priority 1: API Fixes (Backend)

1. **Customer name construction:**
   ```sql
   COALESCE(
     NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), ''),
     company,
     'Unknown'
   ) as name
   ```

2. **Orders count calculation:**
   ```sql
   (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) as orders_count
   ```

3. **Search endpoint parity:**
   - Add same JOINs/aggregates as list endpoint
   - Return: total_revenue, orders_count, last_order_date, tier

### Priority 2: UI Fallback (Temporary)

**In hooks.ts line 585:**
```typescript
// Before
name: c.name || 'Unknown',

// After - use company as fallback
name: c.name || c.company || 'Unknown',
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `dashboard-api/src/routes/customers.ts` | Fix name construction, orders_count |
| `dashboard-api/src/routes/customers-search.ts` | Add missing aggregate fields |
| `ui-v3/src/lib/hooks.ts` | Temporary: fallback to company for name |

---

## Verification Commands

```bash
# Check API customer response
curl -s "https://mintprints-api.ronny.works/api/customers?limit=1" | jq '.customers[0]'

# Check search endpoint response
curl -s "https://mintprints-api.ronny.works/api/customers/search?q=kaos" | jq '.customers[0]'

# Compare fields
curl -s "https://mintprints-api.ronny.works/api/customers?limit=1" | jq '.customers[0] | keys'
curl -s "https://mintprints-api.ronny.works/api/customers/search?q=kaos" | jq '.customers[0] | keys'
```

---

## Summary

| Issue | Layer | Status |
|-------|-------|--------|
| Name = "Unknown" | API | **Bug** - name field not populated |
| Orders = 0 | API | **Bug** - orders_count not calculated |
| Search missing fields | API | **Bug** - search endpoint incomplete |
| Name fallback | UI | Missing company fallback |
