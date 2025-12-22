# Search Systems Audit - December 22, 2025

> **Goal**: Understand current search implementations and plan unified global search

---

## Current State: ui-v3

### Search Locations (REDUNDANT)

| Location | Type | Works? | Behavior |
|----------|------|--------|----------|
| Header (global) | Input + Enter | Partial | Navigates to order if numeric, else goes to orders page |
| Orders page | Input | Yes | Client-side filter by customer name, nickname |
| Quotes page | Input | Yes | Client-side filter by quote number, customer |
| Customers page | Input + Button | Yes | API search with debounce, filter + sort |

### Problems Identified

1. **No typeahead/autocomplete** - Must press Enter or button to search
2. **No dropdown results** - Can't see matches as you type
3. **No unified search** - Can't search orders + customers together
4. **Inconsistent UX** - Each page has different search behavior
5. **Global search limited** - Only works with order numbers

### Current Implementation Files

| File | Lines | Purpose |
|------|-------|---------|
| `App.tsx` | 159-170 | Global search handler (Enter key only) |
| `components/orders/OrdersList.tsx` | 43-57 | Client-side filter |
| `components/quotes/QuotesListPage.tsx` | 62-69 | Client-side filter |
| `components/customers/CustomersListPage.tsx` | 74-87 | API search with button |

### App.tsx Current Search Handler
```typescript
const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' && globalSearch.trim()) {
    const searchTerm = globalSearch.trim();
    if (/^\d+$/.test(searchTerm)) {
      setSelectedOrderId(searchTerm);
      setCurrentView('order-detail');
    } else {
      setCurrentView('orders');
    }
    setGlobalSearch('');
  }
};
```

---

## Reference: PrintShopPro GlobalSearch

### Features

| Feature | Implementation |
|---------|----------------|
| Typeahead dropdown | Shows results as you type |
| Multi-entity search | Customers, Quotes, Jobs in one dropdown |
| Icons per type | User icon for customers, FileText for quotes, Briefcase for jobs |
| Client-side filtering | Uses `useMemo` for instant results |
| Click to navigate | Calls `onSelectQuote`, `onSelectJob`, `onSelectCustomer` |
| Focus/blur handling | Dropdown shows on focus, hides on blur with timeout |
| Max results | Limited to 10 results |
| No results state | Shows "No results found" message |

### Key Code Patterns

**File**: `src/components/GlobalSearch.tsx` (164 lines)

```typescript
// Props - receives data from parent
interface GlobalSearchProps {
  quotes: Quote[]
  jobs: Job[]
  customers: Customer[]
  onSelectQuote: (quote: Quote) => void
  onSelectJob: (job: Job) => void
  onSelectCustomer: (customer: Customer) => void
}

// Typed search results
type SearchResult =
  | { type: 'quote'; data: Quote }
  | { type: 'job'; data: Job }
  | { type: 'customer'; data: Customer }

// Client-side search with useMemo
const results = useMemo(() => {
  if (!searchTerm.trim()) return []
  const term = searchTerm.toLowerCase()
  const searchResults: SearchResult[] = []

  customers.forEach(customer => {
    if (customer.name.toLowerCase().includes(term) ||
        customer.company?.toLowerCase().includes(term)) {
      searchResults.push({ type: 'customer', data: customer })
    }
  })
  // ... similar for quotes, jobs

  return searchResults.slice(0, 10)
}, [searchTerm, quotes, jobs, customers])

// Blur with timeout to allow click
onBlur={() => setTimeout(() => setIsFocused(false), 200)}
```

### UX Flow
1. User focuses search input
2. User types "dav"
3. Dropdown appears with categorized results
4. User clicks result OR uses arrow keys + Enter
5. App navigates to selected item detail page
6. Search clears

---

## API Search Capabilities

### Orders Search
```bash
curl "https://mintprints-api.ronny.works/api/orders?search=david&limit=3"
```
Searches: `customer_name`, `order_nickname`, `visual_id`

### Customers Search
```bash
curl "https://mintprints-api.ronny.works/api/customers/search?q=david&limit=3"
```
Searches: `name`, `company`, `email`

### Quotes Search
No dedicated search endpoint - would need to add or use client-side

### Unified Search Endpoint
**Does not exist** - Returns 404:
```bash
curl "https://mintprints-api.ronny.works/api/search?q=david"
# {"error":"Not found"}
```

---

## Proposed: Unified GlobalSearch Component

### Architecture

```
┌─────────────────────────────────────────────────┐
│  GlobalSearch (Header)                          │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │ 🔍 Search orders, customers...          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ ORDERS                            ▸     │    │
│  │  #13689 - Papa's Raw Bar                │    │
│  │  #13708 - Fondue Disclaimer             │    │
│  ├─────────────────────────────────────────┤    │
│  │ CUSTOMERS                         ▸     │    │
│  │  David Jativa - Get Wet                 │    │
│  │  Julian Davidson - Arbors Angels        │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Component Structure

```
src/
  components/
    search/
      GlobalSearch.tsx      # Main component
      SearchResults.tsx     # Dropdown container
      SearchResultItem.tsx  # Individual result row
      useGlobalSearch.ts    # Hook with debounce + API
```

### Implementation Options

| Option | Pros | Cons |
|--------|------|------|
| **A. Client-side only** | Instant, simple | Needs all data loaded |
| **B. API search** | Scalable, fresh data | Slower, needs endpoint |
| **C. Hybrid** | Best of both | More complex |

**Recommendation**: Option A (Client-side) initially, same as PrintShopPro

### Features to Implement

| Feature | Priority | Effort | Notes |
|---------|----------|--------|-------|
| Typeahead dropdown | HIGH | 1h | Core functionality |
| Multi-entity results | HIGH | 1h | Orders + Customers |
| Category headers | MEDIUM | 30m | "ORDERS", "CUSTOMERS" sections |
| Icons per type | MEDIUM | 30m | Visual distinction |
| Keyboard navigation | MEDIUM | 1h | ↑↓ arrow keys, Enter |
| Click outside close | MEDIUM | 30m | useFocusOutside hook |
| Recent searches | LOW | 1h | localStorage history |
| Cmd+K shortcut | LOW | 30m | Power user feature |
| Debounced input | LOW | 30m | Only if API-based |

### Data Requirements

For client-side search, need:
- Orders list (already loaded in App.tsx via `useOrders`)
- Customers list (already loaded in App.tsx via `useCustomers`)
- Quotes list (need to add `useQuotes` hook if not present)

### Pages to Modify

| Page | Change |
|------|--------|
| `App.tsx` | Replace Input with GlobalSearch component |
| `OrdersList.tsx` | Keep local search (filters visible list) |
| `QuotesListPage.tsx` | Keep local search |
| `CustomersListPage.tsx` | Keep local search + filters |

---

## Implementation Plan

### Phase 1: Create GlobalSearch Component (2h)

1. **Create `src/components/search/GlobalSearch.tsx`**
   - Port from PrintShopPro pattern
   - Adapt types for ui-v3 (Order vs Job terminology)
   - Add visual styling matching ui-v3 design

2. **Create `src/components/search/useGlobalSearch.ts`**
   - useMemo for filtered results
   - State management for focus/blur

### Phase 2: Integrate into App.tsx (30m)

1. Import GlobalSearch component
2. Pass orders, customers, quotes data
3. Implement navigation callbacks
4. Remove or keep existing search input (backup)

### Phase 3: Polish & Edge Cases (1h)

1. Handle empty states
2. Handle loading states
3. Add keyboard shortcuts
4. Test with large datasets
5. Mobile responsiveness

### Phase 4: Optional Enhancements (If Time)

1. Recent searches dropdown
2. Cmd+K modal mode
3. Search history in localStorage

---

## Questions for Ronny

1. **Include quotes in global search?**
   - (A) Yes, all three: Orders, Customers, Quotes
   - (B) Just Orders + Customers for now

2. **Max results per category?**
   - PrintShopPro shows 10 total
   - Suggest: 5 per category (15 max total)

3. **Keyboard shortcut?**
   - (A) Cmd+K (like Notion, Slack)
   - (B) "/" (like GitHub)
   - (C) No shortcut, just click

4. **Keep page-level searches?**
   - Global search for navigation
   - Page search for filtering visible list
   - Recommend: Keep both

---

## Summary

### What PrintShopPro Does Well (Copy These)
1. Instant typeahead with useMemo
2. Categorized results with icons
3. Simple props interface
4. Blur timeout for click handling
5. Max results limit

### What ui-v3 Is Missing
1. Dropdown results as you type
2. Multi-entity search in one place
3. Visual category separation
4. Keyboard navigation
5. Focus management

### Files to Create
- `src/components/search/GlobalSearch.tsx`
- `src/components/search/useGlobalSearch.ts` (optional)

### Files to Modify
- `src/App.tsx` - Replace header search input

### Estimated Total Effort
- **Minimum**: 2-3 hours (basic dropdown)
- **Full Feature**: 4-5 hours (with keyboard nav, polish)

### Recommended Version
**v2.4.0** - This is a significant UX improvement worthy of minor version bump
