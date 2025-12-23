# Remaining Issues for v3.0

**Generated:** December 23, 2025
**Total Issues:** 24

---

## Critical (Must Fix Before Launch) - 0 Issues

✅ No critical issues found

---

## High (Should Fix) - 8 Issues

### H1. Console.log Statements (19 total)
- **Page:** Multiple files
- **Issue:** Debug statements left in production code
- **Files:**
  - `src/App.tsx:71`
  - `src/lib/hooks.ts:433-576` (10 statements)
  - `src/components/orders/OrderDetailPage.tsx:860-862, 1625`
  - `src/components/customers/CustomerDetailPage.tsx:164, 182`
  - `src/components/quotes/QuoteBuilderPage.tsx:72, 80`
- **Fix:** Remove all console.log statements

### H2. Line Item Edits Don't Persist
- **Page:** Order Detail
- **Issue:** Editing line item fields updates local state only, not saved to API
- **File:** `src/components/orders/OrderDetailPagePSP.tsx:102`
- **Fix:** Implement `PUT /api/orders/:id/line-items/:id`

### H3. Bundle Size Warning
- **Page:** Build
- **Issue:** JS bundle is 663KB, exceeds 500KB limit
- **File:** Build output
- **Fix:** Implement code splitting with dynamic imports

### H4. Decoration Field Uses Free Text
- **Page:** Order Detail / Add Imprint
- **Issue:** Location and Type fields are free text instead of autocomplete
- **File:** `src/components/orders/OrderDetailPage.tsx:628-705`
- **Fix:** Replace with Combobox/Autocomplete using top suggestions

### H5. Mockups Not Associated with Imprints
- **Page:** Order Detail
- **Issue:** Mockups only link to line items, not specific imprint locations
- **File:** `src/lib/hooks.ts:438-495`
- **Fix:** API needs to populate `imprints[].mockups[]` from database

### H6. TODO: Add Discount and Tax Calculation
- **Page:** Order Detail PSP
- **Issue:** Total doesn't include discount/tax
- **File:** `src/components/orders/OrderDetailPagePSP.tsx:243`
- **Fix:** Calculate total with discount and tax from order data

### H7. Customer Order History May Not Load
- **Page:** Customer Detail
- **Issue:** Orders tab may not display customer's orders
- **File:** `src/components/customers/CustomerDetailPage.tsx`
- **Fix:** Verify API call and data mapping

### H8. More Actions Menu Missing Items
- **Page:** Order Detail
- **Issue:** Only has Print + Email, missing Duplicate/Archive/Delete
- **File:** `src/components/orders/MoreActionsMenu.tsx`
- **Fix:** Add handlers (requires API endpoints)

---

## Medium (Nice to Have) - 10 Issues

### M1. Size Category Tabs Not Implemented
- **Page:** Order Detail
- **Issue:** All sizes shown in one view, no Adult/Youth/Toddler tabs
- **File:** `src/components/orders/OrderDetailPage.tsx:760-787`
- **Fix:** Add tab switcher for size categories

### M2. Notes Sections Not Collapsible
- **Page:** Order Detail
- **Issue:** Production Notes and Order Notes take up space, should collapse
- **File:** `src/components/orders/OrderDetailPage.tsx:2166-2210`
- **Fix:** Wrap in `<Collapsible>` component

### M3. Reports Charts Not Implemented
- **Page:** Reports
- **Issue:** Shows "coming soon" instead of actual charts
- **File:** `src/pages/ReportsPage.tsx:226`
- **Fix:** Implement revenue/analytics charts

### M4. Artwork Sidebar Layout
- **Page:** Order Detail
- **Issue:** Mockups in separate section, should be sidebar
- **File:** `src/components/orders/OrderDetailPagePSP.tsx:388-469`
- **Fix:** Move to sticky sidebar layout

### M5. Status Filters Limited
- **Page:** Orders List
- **Issue:** Limited status filter options
- **File:** `src/components/orders/OrdersList.tsx`
- **Fix:** Add all status options from database

### M6. Customer Tier Shows "UNKNOWN"
- **Page:** Customer Detail
- **Issue:** Tier field may display as "UNKNOWN"
- **File:** `src/components/customers/CustomerDetailPage.tsx`
- **Fix:** Map tier values correctly

### M7. Quotes Create Flow Redirects
- **Page:** Quotes
- **Issue:** "New Quote" redirects to order create page
- **File:** `src/App.tsx:243`
- **Fix:** Create dedicated quote builder flow

### M8. CSS Build Warning
- **Page:** Build
- **Issue:** @media syntax warning in CSS output
- **File:** CSS dependencies
- **Fix:** Update CSS or suppress warning

### M9. Missing Keyboard Shortcuts
- **Page:** All
- **Issue:** No keyboard shortcuts for common actions
- **File:** Various
- **Fix:** Add global keyboard handler (Cmd+S, Cmd+N, etc.)

### M10. No Loading Skeletons
- **Page:** Order Detail, Customer Detail
- **Issue:** Shows blank during loading
- **File:** Various
- **Fix:** Add skeleton loading states

---

## Low (Future Enhancement) - 6 Issues

### L1. EasyPost Shipping Integration
- **Page:** Order Detail
- **Issue:** No shipping label generation
- **Fix:** Requires EasyPost API integration

### L2. PDF Invoice Generation
- **Page:** Order Detail
- **Issue:** No PDF download option
- **Fix:** Requires `GET /api/orders/:id/pdf` endpoint

### L3. Email Customer Feature
- **Page:** Order Detail
- **Issue:** Only mailto link, no in-app email
- **Fix:** Requires email template system

### L4. Duplicate Order Feature
- **Page:** Order Detail
- **Issue:** Not implemented
- **Fix:** Requires `POST /api/orders/:id/duplicate` endpoint

### L5. Archive Order Feature
- **Page:** Order Detail
- **Issue:** Not implemented
- **Fix:** Requires archive status in database

### L6. Production Calendar View
- **Page:** Dashboard
- **Issue:** No calendar view of orders by due date
- **Fix:** New component needed

---

## Issue Summary by Category

| Category | Count | Priority |
|----------|-------|----------|
| Code Quality | 4 | HIGH |
| Data Persistence | 2 | HIGH |
| UI/UX | 8 | MEDIUM |
| Missing Features | 6 | LOW |
| API Dependencies | 4 | LOW |

---

## Quick Wins (< 30 min each)

1. ✅ Remove console.log statements
2. ✅ Add discount+tax to PSP total calculation
3. ✅ Make notes collapsible
4. ✅ Fix CSS build warning
