# UI QA Audit - December 22, 2025

> **Tester**: Ronny
> **Version**: v2.2.3
> **Target**: v2.2.4

## Critical Issues (Blocking)

### 1. Global Search (Header) - BROKEN
- **Location**: Header search bar (all pages)
- **Issue**: Typing order number and pressing Enter does nothing
- **Reference**: PrintShopPro search bar worked great - port it
- **Files**: App.tsx, need new SearchBar component

### 2. Orders Page Pagination - BROKEN
- **Location**: /orders page, "Next" button
- **Issue**: Cannot navigate to page 2, stuck on first page
- **Impact**: Cannot view order 6978 or any older orders
- **Files**: OrdersPage or wherever pagination is handled

### 3. Orders Page Search - BROKEN
- **Location**: /orders page, search input
- **Issue**: Two search bars exist, neither works
- **Fix**: Remove redundant search, wire the one that stays

## High Priority Issues

### 4. Imprint Mockup Popup - BLANK
- **Location**: Order detail page, click imprint thumbnail
- **Issue**: Modal opens but shows blank screen with "Imprint Mockup" text only
- **Cause**: Image URL not loading in modal, or modal not receiving URL
- **Files**: OrderDetailPage.tsx (image modal logic)

### 5. Status Dropdown - INCOMPLETE
- **Location**: Order detail header
- **Issues**:
  a) Order 13689 shows "QUOTE" but should be "COMPLETE"
  b) Dropdown only has 10 statuses, missing actual Printavo statuses
- **Data**: API returns `printavoStatusName` which has the real status
- **Fix**: Use actual status from API, populate dropdown with all Printavo statuses
- **Files**: OrderDetailPage.tsx, hooks.ts

### 6. Customer Info - NOT EDITABLE
- **Location**: Order detail, customer card
- **Issues**:
  a) Cannot edit customer details inline
  b) Missing customer address display
- **Files**: OrderDetailPage.tsx (customer section)

## Quotes Page Issues

### 7. Quotes Page Style Mismatch
- **Location**: /quotes
- **Issue**: Doesn't match /orders page styling
- **Fix**: Use same card/table components as orders

### 8. Duplicate "New Quote" Buttons
- **Location**: /quotes page
- **Issue**: Button in header AND on page body
- **Fix**: Keep header button only, remove page button

### 9. "New Quote" Button Not Wired
- **Location**: Header "New Quote" button
- **Issue**: Click does nothing
- **Fix**: Navigate to /quotes/new or open quote builder

### 10. "Convert to Order" Button Style
- **Location**: Quote detail page
- **Issue**: Green button doesn't match other buttons
- **Fix**: Use consistent button styling

### 11. Add Line Item UX - WRONG PATTERN
- **Location**: Quote detail, "Add Line Item" button
- **Issue**: Opens modal popup
- **Better UX**: Create new blank row inline in table (like spreadsheet)
- **Files**: QuoteDetail or LineItemsTable component

### 12. Cannot Add Imprints
- **Location**: Quote detail page
- **Issue**: Only shows 1 imprint box, no way to add more
- **Fix**: Add "Add Imprint" button per line item

## Working (No Changes Needed)

- Customers page - search and filtering work
- Reports page - displays stats correctly
- Production files display
- Customer info displays (just not editable)
- Imprint mockup thumbnail shows
