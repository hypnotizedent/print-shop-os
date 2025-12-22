# Order Detail Page Audit - December 22, 2025

## Current State Analysis

### Page Structure
- **Total lines**: 2,275
- **Main components**:
  - `OrderDetailPage` (main page)
  - `LineItemsTable` (table view)
  - `LineItemCard` (card view)
  - `ImprintCard` (imprint display)
  - `ImageModal` (lightbox)
  - `MockupUploadDialog` (file upload)
  - `AddLineItemDialog` (new line item)
  - `AddImprintDialog` (new imprint)
  - `PdfThumbnail` (PDF preview)
- **Data source**: `useOrderDetail` hook from `hooks.ts`

### Fields Displayed vs API Available

| UI Section | Field Shown | API Field | Status | Notes |
|------------|-------------|-----------|--------|-------|
| Header | Order # | visualId | WORKING | Shows correctly |
| Header | Order Name | orderNickname | WORKING | Shows after # |
| Header | Status | printavoStatusName | WORKING | Dropdown with 10 options |
| Header | Total | totalAmount | WORKING | Formatted as currency |
| Header | Balance | amountOutstanding | WORKING | Shows outstanding |
| Customer | Name | customer.name | WORKING | Clickable link |
| Customer | Company | customer.company | WORKING | Shows if different from name |
| Customer | Email | customer.email | WORKING | mailto link |
| Customer | Phone | customer.phone | WORKING | tel link |
| Customer | Address | - | MISSING | API doesn't return address |
| Dates | Created | createdAt | WORKING | Formatted date |
| Dates | Due | dueDate | WORKING | Red if overdue |
| Dates | Customer Due | customerDueDate | WORKING | Shows if different |
| Line Items | Description | lineItems[].description | WORKING | |
| Line Items | Style # | lineItems[].styleNumber | WORKING | |
| Line Items | Color | lineItems[].color | WORKING | |
| Line Items | Sizes | lineItems[].sizes | PARTIAL | Shows grid, but data often all zeros |
| Line Items | Total Qty | lineItems[].totalQuantity | WORKING | |
| Line Items | Unit Cost | lineItems[].unitCost | WORKING | |
| Line Items | Mockup | lineItems[].mockup | PARTIAL | Shows placeholder if null |
| Imprints | Location | imprints[].location | WORKING | |
| Imprints | Type | imprints[].decorationType | WORKING | |
| Imprints | Description | imprints[].description | WORKING | |
| Imprints | Colors | imprints[].colors | WORKING | Often empty in API |
| Imprints | Dimensions | imprints[].width/height | PARTIAL | Often null in API |
| Imprints | Mockups | imprints[].mockups | PARTIAL | Uses order-level mockups |
| Files | Production Files | artworkFiles | WORKING | Filtered by source |
| Notes | Production Notes | productionNotes | WORKING | Renders HTML |
| Notes | Customer Notes | notes | WORKING | Plain text |
| Payment | Subtotal | calculated | WORKING | total - tax |
| Payment | Tax | salesTax | WORKING | |
| Payment | Paid | calculated | WORKING | total - outstanding |

### CRITICAL: Hardcoded/Placeholder Data Found

| Location | Lines | Description | Impact |
|----------|-------|-------------|--------|
| hooks.ts | 400-451 | **Mock imprints added when none exist** | Shows fake "Logo design", "Text and design on back" |
| hooks.ts | 459-464 | **Mock line item mockup** | Shows placeholder.com image |
| hooks.ts | 415-428 | Mock imprint mockups | Uses via.placeholder.com URLs |
| hooks.ts | 441-448 | More mock mockups | Purple/red placeholder images |

**This is the source of the fake "8.5 x 11" and "Front/Back" data!**

### Data Flow Analysis

```
1. OrderDetailPage calls useOrderDetail(visualId)
2. useOrderDetail fetches /api/orders/{id}
3. API returns order with lineItems, imprintMockups, customer, etc.
4. hooks.ts transforms data:
   - Maps snake_case to camelCase
   - Distributes order-level imprintMockups to imprints
   - PROBLEM: Adds mock data if imprints array is empty
   - PROBLEM: Adds mock mockup if line item has no mockup
5. UI renders transformed data
```

### UI/UX Issues Observed

1. **Size columns**: Display XS through 6XL but data often all zeros
2. **Imprint nesting**: Works but fake data confuses users
3. **Mockup thumbnails**: Mix of real (from API) and fake (placeholder.com)
4. **Empty states**: Don't clearly indicate "no data" vs "loading"
5. **Edit mode**: Exists but saves don't persist (toast only)

## Recommended Changes

### Priority 1: Remove Mock/Placeholder Data (CRITICAL)

**File: src/lib/hooks.ts**

| Lines | Current | Proposed |
|-------|---------|----------|
| 400-451 | Adds fake imprints if none exist | Return empty array, let UI show "No imprints" |
| 453-464 | Adds fake mockup if none exists | Return null, let UI show placeholder icon |

**Impact**: Real data will display correctly; empty states will be obvious

### Priority 2: Improve Empty States

| Section | Current State | Proposed |
|---------|---------------|----------|
| Imprints | Shows fake data | Show "No imprints" message with "Add Imprint" button |
| Mockups | Shows placeholder.com image | Show camera icon with "No mockup" text |
| Sizes | Shows columns with all zeros | Hide size columns if totalQuantity matches sizes.other |

### Priority 3: Size Column Optimization

Options:
1. **Hide individual sizes if all zero** - Show only "Total" column
2. **Collapse to summary** - "132 items (sizes not specified)"
3. **Smart columns** - Only show sizes with values > 0

### Priority 4: Data Accuracy Improvements

| Issue | Fix |
|-------|-----|
| Imprint dimensions often null | Show "-" or hide field if null |
| Colors often empty string | Show "Not specified" if empty |
| Mockup sometimes PDF | Already handled with PdfThumbnail |

## Questions for Ronny

1. **Mock data removal**: Ready to remove fake imprints/mockups? This will show "empty" states for orders without that data.

2. **Size columns**: Prefer to:
   - (A) Always show all size columns (current)
   - (B) Only show sizes with values > 0
   - (C) Collapse to single "Qty" column when sizes not specified

3. **Empty imprints**: For orders with no imprints:
   - (A) Show "No imprints" with Add button
   - (B) Hide imprints section entirely
   - (C) Show collapsed row "No imprints for this line item"

4. **Edit functionality**: Currently shows toast but doesn't save. Priority to wire up?

## Specific Code Changes Needed

### File: src/lib/hooks.ts

| Lines | Current | Proposed | Reason |
|-------|---------|----------|--------|
| 400-451 | Mock imprint injection | Delete entire block | Remove fake data |
| 453-464 | Mock mockup fallback | Change to `const mockup = li.mockup ? {...} : null;` | Show real empty state |

### File: src/components/orders/OrderDetailPage.tsx

| Component | Change | Reason |
|-----------|--------|--------|
| LineItemsTable | Add empty imprint state | Better UX when no imprints |
| Size columns | Conditional rendering | Hide if all zeros |
| Mockup column | Empty state icon | Instead of broken image |

## Summary

### Issues Found: 4 Critical, 3 High, 5 Medium

**Critical (Blocking real data display)**:
1. Mock imprints injected when API returns empty (hooks.ts:400-451)
2. Mock mockup injected for line items (hooks.ts:453-464)
3. Mock mockup URLs using via.placeholder.com
4. Dimensions "8.5 x 11" are fake test values

**High (UX Problems)**:
1. Size columns show all zeros (data issue, not bug)
2. Empty states show fake data instead of "empty"
3. Can't distinguish real vs fake mockups

**Medium (Polish)**:
1. Status dropdown missing some statuses (needs full list)
2. Customer address not available from API
3. Edit handlers don't persist
4. Size columns always visible even when irrelevant
5. No loading skeleton for individual sections

### Recommended Next Steps

1. **Immediate**: Remove mock data injection from hooks.ts
2. **Soon**: Add proper empty states to OrderDetailPage
3. **Later**: Wire edit handlers to API, optimize size columns
