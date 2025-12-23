# v3.0 Completion Plan

**Created:** December 23, 2025
**Target:** Production-ready release
**Estimated Total Effort:** 16-20 hours

---

## Phase 1: Code Quality (3 hours)

### 1.1 Remove Debug Statements (1 hour)
**Priority:** HIGH
**Files to modify:**
- [ ] `src/App.tsx` - Remove line 71
- [ ] `src/lib/hooks.ts` - Remove lines 433-576 (10 statements)
- [ ] `src/components/orders/OrderDetailPage.tsx` - Remove lines 860-862, 1625
- [ ] `src/components/customers/CustomerDetailPage.tsx` - Remove lines 164, 182
- [ ] `src/components/quotes/QuoteBuilderPage.tsx` - Remove lines 72, 80

**Testing:**
- [ ] Run `grep -rn "console\.log" src/` - should return 0 results
- [ ] Verify app still functions correctly

### 1.2 Resolve TODO Comments (1 hour)
**Priority:** HIGH
- [ ] PSP Line 102: Add comment "API not yet available" or implement
- [ ] PSP Line 243: Implement discount+tax calculation

### 1.3 Bundle Optimization (1 hour)
**Priority:** MEDIUM
- [ ] Implement lazy loading for OrderDetailPage
- [ ] Implement lazy loading for CustomerDetailPage
- [ ] Add Suspense boundaries with fallback UI

```tsx
const OrderDetailPage = lazy(() => import('./components/orders/OrderDetailPage'));
const CustomerDetailPage = lazy(() => import('./components/customers/CustomerDetailPage'));
```

---

## Phase 2: Data Persistence (4 hours)

### 2.1 Line Item Save API (2 hours)
**Priority:** HIGH
**Depends on:** API endpoint `PUT /api/orders/:id/line-items/:id`

**Implementation:**
```tsx
// In OrderDetailPagePSP.tsx
const handleSaveLineItem = async (lineItem: PSPLineItem) => {
  const response = await fetch(
    `${API_BASE}/api/orders/${visualId}/line-items/${lineItem.id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        style_number: lineItem.product_sku,
        description: lineItem.product_name,
        color: lineItem.product_color,
        unit_cost: lineItem.unit_price,
        // Map sizes...
      }),
    }
  );
  if (!response.ok) throw new Error('Failed to save');
  refetch();
};
```

### 2.2 Imprint Save API (2 hours)
**Priority:** HIGH
**Depends on:** API endpoint `PUT /api/orders/:id/imprints/:id`

---

## Phase 3: UI Improvements (6 hours)

### 3.1 Collapsible Notes (1 hour)
**Priority:** MEDIUM
**Files:** `OrderDetailPage.tsx`, `OrderDetailPagePSP.tsx`

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

<Collapsible defaultOpen={false}>
  <CollapsibleTrigger className="flex items-center gap-2">
    <CaretRight className={cn("transition-transform", open && "rotate-90")} />
    <span>Notes</span>
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Notes content */}
  </CollapsibleContent>
</Collapsible>
```

### 3.2 Decoration Autocomplete (2 hours)
**Priority:** HIGH
**Files:** `OrderDetailPage.tsx` AddImprintDialog

**Top Suggestions:**
```tsx
const DECORATION_SUGGESTIONS = [
  'Front Chest Screen Print',
  'Full Back Screen Print',
  'Left Chest Screen Print',
  'Left Chest Embroidery',
  'Front Panel Embroidery',
  'Full Back',
  'Front Chest Premium Transfer',
  'Left Chest Premium Transfer',
  'Private Labeling',
];
```

### 3.3 Size Category Tabs (2 hours)
**Priority:** MEDIUM
**Files:** `OrderDetailPage.tsx` LineItemsTable

```tsx
<Tabs defaultValue="adult">
  <TabsList>
    <TabsTrigger value="adult">Adult</TabsTrigger>
    <TabsTrigger value="youth">Youth</TabsTrigger>
    <TabsTrigger value="toddler">Toddler</TabsTrigger>
  </TabsList>
  <TabsContent value="adult">
    {/* XS, S, M, L, XL, 2XL, 3XL columns */}
  </TabsContent>
  {/* ... */}
</Tabs>
```

### 3.4 Loading Skeletons (1 hour)
**Priority:** LOW
**Files:** Order and Customer detail pages

---

## Phase 4: More Actions Menu (3 hours)

### 4.1 Duplicate Order (1 hour)
**Depends on:** `POST /api/orders/:id/duplicate`

### 4.2 Archive Order (1 hour)
**Depends on:** `POST /api/orders/:id/archive`

### 4.3 Download PDF (1 hour)
**Depends on:** `GET /api/orders/:id/pdf`

---

## Dependencies

### API Endpoints Required (ronny-ops)

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/orders/:id/line-items/:id` | PUT | Update line item | HIGH |
| `/api/orders/:id/imprints/:id` | PUT | Update imprint | HIGH |
| `/api/orders/:id/duplicate` | POST | Clone order | MEDIUM |
| `/api/orders/:id/archive` | POST | Archive order | MEDIUM |
| `/api/orders/:id/pdf` | GET | Generate PDF | LOW |

### UI Components Required

| Component | Source | Purpose |
|-----------|--------|---------|
| Collapsible | shadcn/ui | Notes collapse |
| Combobox | shadcn/ui | Decoration autocomplete |
| Tabs | shadcn/ui | Size category switcher |
| Skeleton | shadcn/ui | Loading states |

---

## Testing Checklist

### Before Each Phase
- [ ] Run `npx tsc --noEmit` - no errors
- [ ] Run `npm run build` - builds successfully
- [ ] Test affected pages manually

### Final Testing
- [ ] Orders list loads and displays correctly
- [ ] Order detail shows all data
- [ ] Line items display with sizes
- [ ] Decorations can be added
- [ ] Save button persists changes
- [ ] Customer detail loads
- [ ] Reports page functional
- [ ] No console errors in DevTools
- [ ] No TypeScript warnings

---

## Launch Criteria

### Must Have (v3.0)
- [x] Zero TypeScript errors
- [ ] Zero console.log statements
- [ ] Line item edits persist to API
- [ ] Decoration autocomplete implemented
- [ ] Notes sections collapsible

### Should Have (v3.0)
- [ ] Bundle under 500KB
- [ ] Size category tabs
- [ ] Loading skeletons

### Nice to Have (v3.1)
- [ ] Duplicate order
- [ ] Archive order
- [ ] PDF download

---

## Implementation Order

```
Week 1:
├── Day 1: Phase 1 (Code Quality)
│   ├── 1.1 Remove console.log (1h)
│   ├── 1.2 Resolve TODOs (1h)
│   └── 1.3 Bundle optimization (1h)
│
├── Day 2-3: Phase 2 (Data Persistence)
│   ├── 2.1 Line item save (2h)
│   └── 2.2 Imprint save (2h)
│
└── Day 4-5: Phase 3 (UI Improvements)
    ├── 3.1 Collapsible notes (1h)
    ├── 3.2 Decoration autocomplete (2h)
    ├── 3.3 Size category tabs (2h)
    └── 3.4 Loading skeletons (1h)

Week 2 (if time):
└── Phase 4 (More Actions)
    ├── 4.1 Duplicate (1h)
    ├── 4.2 Archive (1h)
    └── 4.3 PDF (1h)
```

---

## Rollback Plan

If issues arise after deployment:
1. Git revert to previous commit
2. Redeploy from backup tag
3. Document issue for post-mortem

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| TypeScript Errors | 0 | 0 ✅ |
| Console.log Count | 0 | 19 |
| Bundle Size | <500KB | 663KB |
| Page Load Time | <2s | TBD |
| User Reported Bugs | 0 | TBD |
