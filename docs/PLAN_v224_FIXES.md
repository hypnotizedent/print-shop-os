# v2.2.4 Implementation Plan

## Priority Order

### Phase 1: Critical Navigation (Do First)
1. **Fix pagination** - Orders page Next/Prev buttons
2. **Fix global search** - Header search bar navigation
3. **Fix orders search** - Remove duplicate, wire single search

### Phase 2: Order Detail Fixes
4. **Fix imprint mockup modal** - Pass correct URL to modal
5. **Fix status dropdown** - Use printavoStatusName, add all statuses
6. **Add customer address** - Display shipping/billing address

### Phase 3: Quotes Page Polish
7. **Match quotes styling to orders** - Same components
8. **Remove duplicate New Quote button**
9. **Wire New Quote button** - Navigate to builder
10. **Fix Convert to Order styling**

### Phase 4: UX Improvements (If Time)
11. **Inline Add Line Item** - Replace modal with inline row
12. **Add Imprint button** - Per line item

## Files to Modify

| File | Changes |
|------|---------|
| App.tsx | Global search handler |
| OrdersList.tsx | Pagination, search |
| OrderDetailPage.tsx | Modal, status, customer |
| QuotesListPage.tsx | Styling, remove button |
| hooks.ts | Status mapping, pagination |

## Implementation Notes

### Pagination Fix
- Check if `useOrdersList` hook supports page parameter
- Wire Next/Prev buttons to increment/decrement page
- Display current page / total pages

### Global Search Fix
- Add `onSearch` handler to header search bar
- If input is numeric, navigate to `/orders/{number}`
- If text, filter orders list by customer name or nickname

### Status Dropdown Fix
- Fetch all unique statuses from API
- Use `printavoStatusName` as the display value
- On change, call POST /api/orders/:id/status

### Imprint Modal Fix
- Verify `onImageClick` passes correct URL
- Check ImageModal component receives and displays the URL
- Handle PDF files specially (link instead of image)
