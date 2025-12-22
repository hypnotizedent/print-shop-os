# Next Features Implementation Plans

> **Created**: December 22, 2025
> **Current Version**: v2.4.0
> **Next Target**: v2.5.0

---

## Feature 1: Imprint CRUD (HIGH PRIORITY)

### Current State
- "Add Imprint" button shows toast placeholder (OrderDetailPage.tsx:1136)
- Imprints display read-only from API
- No edit/delete capability
- Existing imprint editing cells just show toast

### API Endpoints Needed (ronny-ops)

```
POST   /api/orders/:id/imprints
Body: {
  line_item_id: number,
  location: string,           // "Front Chest", "Full Back", etc.
  decoration_type: string,    // "Screen Printing", "Embroidery"
  description: string,
  color_count: number,
  colors: string,             // "Grey Blocker + White"
  width: number,              // 4
  height: number              // 5.5
}
Returns: { success: true, imprint: {...} }

PUT    /api/orders/:id/imprints/:imprintId
Body: { location?, decoration_type?, description?, color_count?, colors?, width?, height? }
Returns: { success: true, imprint: {...} }

DELETE /api/orders/:id/imprints/:imprintId
Returns: { success: true, message: "Imprint deleted" }
```

### UI Changes (spark)

| Component | File | Line | Change |
|-----------|------|------|--------|
| Add Imprint handler | OrderDetailPage.tsx | ~1136 | Wire to POST API |
| Imprint row | OrderDetailPage.tsx | ~1030 | Add edit/delete buttons |
| ImprintEditModal | NEW | - | Modal for editing imprint details |
| handleImprintCellBlur | OrderDetailPage.tsx | ~760 | Wire to PUT API |

### Data Model (Reference)

```typescript
interface Imprint {
  id: number;
  lineItemId: number;
  location: string;        // "Front Chest", "Full Back", etc.
  decorationType: string;  // "Screen Printing", "Embroidery", etc.
  description: string;     // Full description text
  colorCount: number;
  colors: string;          // "Grey Blocker + White"
  width: number;           // 4
  height: number;          // 5.5
}
```

### Database Tables

```sql
-- imprints table
id, printavo_id, description, placement_name, decoration_type,
print_width, print_height, color_count, colors, notes

-- imprints_line_item_lnk table (links imprints to line items)
id, imprint_id, line_item_id
```

### Effort: 4-6 hours total
- API (ronny-ops): 2 hours
- UI (spark): 2-4 hours

---

## Feature 2: Line Item Add (HIGH PRIORITY)

### Current State
- "Add Line Item" dialog opens (AddLineItemDialog component exists)
- Save shows toast but doesn't call API
- Modal has: Description, Style Number, Color, Unit Cost
- Missing: Sizes, Quantity, Taxed checkbox

### API Endpoint Needed (ronny-ops)

```
POST /api/orders/:id/line-items
Body: {
  style_description: string,
  style_number?: string,
  color?: string,
  unit_cost: number,
  total_quantity: number,
  sizes?: {
    size_xs: 0, size_s: 10, size_m: 20, size_l: 15,
    size_xl: 5, size_2_xl: 0, size_3_xl: 0
  },
  taxable?: boolean
}
Returns: {
  success: true,
  lineItem: {...},
  orderTotal: number  // Updated order total
}
```

**Note**: Endpoint may already exist - need to verify with:
```bash
curl -X POST "https://mintprints-api.ronny.works/api/orders/13689/line-items" \
  -H "Content-Type: application/json" \
  -d '{"style_description":"Test","unit_cost":10,"total_quantity":1}'
```

### UI Changes (spark)

| Component | File | Change |
|-----------|------|--------|
| handleAddLineItem | OrderDetailPage.tsx | Wire to POST API |
| AddLineItemDialog | OrderDetailPage.tsx | Add size fields grid |
| AddLineItemDialog | OrderDetailPage.tsx | Add total quantity field |
| AddLineItemDialog | OrderDetailPage.tsx | Add taxable checkbox |
| LineItemsTable | OrderDetailPage.tsx | Refresh after add |

### Effort: 2-3 hours total
- API verify/fix (ronny-ops): 30 min
- UI (spark): 2-3 hours

---

## Feature 3: Line Item Delete (HIGH PRIORITY)

### Current State
- Delete button exists in row dropdown menu
- Handler shows toast but doesn't call API

### API Endpoint Needed (ronny-ops)

```
DELETE /api/orders/:id/line-items/:lineItemId
Returns: {
  success: true,
  message: "Line item deleted",
  orderTotal: number  // Updated order total
}
```

### UI Changes (spark)

| Component | File | Change |
|-----------|------|--------|
| handleDelete (line item) | OrderDetailPage.tsx | Wire to DELETE API |
| Confirmation modal | - | Add "Are you sure?" dialog |

### Effort: 1 hour total

---

## Feature 4: Artwork Upload (MEDIUM PRIORITY)

### Current State
- No upload UI exists
- MinIO bucket "artwork" exists at files.ronny.works
- Mockups display from API but can't be uploaded

### API Endpoint Needed (ronny-ops)

```
POST /api/orders/:id/artwork
Content-Type: multipart/form-data
Body: {
  file: binary,
  line_item_id?: number,  // Optional: attach to specific line item
  type: 'mockup' | 'production'  // Optional: categorize
}
Returns: {
  success: true,
  file: {
    id: string,
    url: "https://files.ronny.works/artwork/xxx.png",
    thumbnailUrl: "https://files.ronny.works/artwork/thumb_xxx.png",
    filename: "original.png"
  }
}
```

### Process (ronny-ops)
1. Receive file upload via multer
2. Generate unique file ID (UUID)
3. Create thumbnail if image (sharp library)
4. Upload both to MinIO artwork bucket
5. Create entry in mockups table
6. Return URLs

### UI Changes (spark)

| Component | File | Change |
|-----------|------|--------|
| ArtworkUpload | NEW | Drag-drop file upload component |
| Mockup column | OrderDetailPage.tsx | Add upload zone on empty |
| MockupUploadDialog | OrderDetailPage.tsx | Already exists, wire to API |
| Progress indicator | - | Show upload progress |

### Effort: 3-4 hours total
- API (ronny-ops): 2 hours (MinIO + multer)
- UI (spark): 1-2 hours

---

## Feature 5: Edit Persistence (MEDIUM PRIORITY)

### Current State

Many edit handlers show toast "saved" but don't actually save:

| Handler | Location | Status |
|---------|----------|--------|
| handleCellBlur | OrderDetailPage.tsx:692 | WIRED (line item PUT) |
| handleImprintCellBlur | OrderDetailPage.tsx:760 | Toast only |
| handleStatusChange | OrderDetailPage.tsx:1169 | WIRED (POST status) |
| handleSave (imprint) | OrderDetailPage.tsx | Toast only |

### API Endpoints to Verify

```bash
# Line item update (may be working)
curl -X PUT "https://mintprints-api.ronny.works/api/orders/13689/line-items/123" \
  -H "Content-Type: application/json" \
  -d '{"unit_cost":15.50}'

# Status update (should be working)
curl -X POST "https://mintprints-api.ronny.works/api/orders/13689/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETE"}'

# Customer update
curl -X PUT "https://mintprints-api.ronny.works/api/customers/123" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

### UI Changes (spark)

| Handler | Current | Change |
|---------|---------|--------|
| handleImprintCellBlur | Toast only | Call PUT /imprints/:id |
| handleSaveContact | Toast only | Call PUT /customers/:id |
| handleSaveAddress | Toast only | Call PUT /customers/:id |

### Effort: 4-6 hours total
- API verify (ronny-ops): 1-2 hours
- UI (spark): 3-4 hours

---

## Feature 6: Polish Items (LOW PRIORITY)

### 6a. Add Quotes to Global Search

```typescript
// In GlobalSearch.tsx, add quotes prop and filtering
quotes.forEach(quote => {
  if (quote.quote_number.includes(term) || quote.customer_name.includes(term)) {
    searchResults.push({ type: 'quote', data: quote });
  }
});
```

### 6b. Cmd+K Keyboard Shortcut

```typescript
// In App.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.querySelector('[data-global-search]')?.focus();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 6c. Customer Address Display

- Check if API returns `billingAddress` / `shippingAddress` on order detail
- Add address display to customer card section

### Effort: 2-3 hours total

---

## Implementation Order (Recommended)

### v2.5.0 - CRUD Operations (1-2 days)
1. **Line Item Add** - Verify API, wire UI (2-3h)
2. **Line Item Delete** - Verify API, wire UI (1h)
3. **Imprint CRUD** - Build API, wire UI (4-6h)

### v2.6.0 - File Management (1 day)
4. **Artwork Upload** - MinIO API, drag-drop UI (3-4h)

### v2.7.0 - Edit & Polish (1-2 days)
5. **Edit Persistence** - Verify APIs, wire handlers (4-6h)
6. **Polish items** - Search, shortcuts, address (2-3h)

---

## Dependencies

| Feature | Blocked By |
|---------|------------|
| Imprint CRUD | API endpoints (ronny-ops) |
| Artwork Upload | MinIO upload endpoint (ronny-ops) |
| Edit Persistence | API verification (ronny-ops) |
| Polish | Nothing - can do anytime |
