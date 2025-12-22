# Order Detail Page UI Deep Dive (v2.2.0 Audit)

> Audited: December 22, 2025
> Files: `src/components/orders/OrderDetailPage.tsx` (2029 lines), `OrderDetail.tsx` (928 lines)

---

## 1. Current Page Structure

### Active Component: `OrderDetailPage.tsx`

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                      │
│ #13689 · Papa's Raw Bar                         ● Updated                  │
│                                        [SP - PRODUCTION] $1,303.66         │
│                                        Balance: $0.00              [⋮]     │
├────────────────────────────────────────────────────────────────────────────┤
│ CUSTOMER INFO BAR                                                          │
│ Jonathan Lieberman · PTP Universal                                         │
│ jonathan@email.com · 555-1234              Created Dec 15 · Due Dec 19     │
├────────────────────────────────────────────────────────────────────────────┤
│ LINE ITEMS TABLE                                                           │
│ ┌──────────────────────────────────────────────────────────────────────┐  │
│ │ [expand] | # | Color | Description | Mockup | XS S M L XL... | Price │  │
│ │    ▼     |G5000|Black|Gildan Tee  | [img]  | 0 2 5 8 3  2   |$12.50 │  │
│ │  ├─ [imprint] Front - Screen Print - 2 colors                        │  │
│ │  │  Location: Front | Colors: Black, White | 8" × 11"                │  │
│ │  │  [mockup1] [mockup2]                                              │  │
│ │  ├─ [imprint] Back - Screen Print - 1 color                          │  │
│ │  │  Location: Back | Colors: Black                                   │  │
│ │  │  [mockup]                                                         │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
│ [+ Add Line Item]                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│ PRODUCTION FILES (collapsible)                                             │
│ Images (4): [img][img][img][img]                                          │
│ PDFs (2): [PDF icon] [PDF icon]                                           │
├────────────────────────────────────────────────────────────────────────────┤
│ PRODUCTION NOTES                                                           │
│ <HTML content rendered>                                                    │
├────────────────────────────────────────────────────────────────────────────┤
│ NOTES                                                                      │
│ Plain text order notes                                                     │
└────────────────────────────────────────────────────────────────────────────┘
```

### Key Sub-Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PdfThumbnail` | Lines 51-130 | Renders PDF files with thumbnail fallback |
| `MockupUploadDialog` | Lines 182-358 | Modal for uploading mockup files |
| `AddLineItemDialog` | Lines 361-458 | Modal for adding new line items |
| `AddImprintDialog` | Lines 461-560 | Modal for adding imprints to line items |
| `LineItemsTable` | Lines 579-1073 | Table with expandable imprint rows |
| `LineItemCard` | Lines 1683-2028 | (Legacy) Card-based line item display |
| `ImprintCard` | Lines 1482-1679 | (Legacy) Card-based imprint display |

---

## 2. Mockups Display Locations

### 2.1 Line Item Level Mockups

**Location:** `LineItemsTable` → Line 927-956

```tsx
<td className="px-3 py-1.5 align-top text-center">
  {item.mockup ? (
    <button onClick={() => onImageClick?.(...)}>
      <img src={item.mockup.thumbnail_url || item.mockup.url} />
    </button>
  ) : (
    <span className="text-muted-foreground/30">-</span>
  )}
</td>
```

**Display:** 10×10 thumbnail in table cell, clickable to open modal

### 2.2 Imprint Level Mockups

**Location:** `LineItemsTable` (imprint rows) → Lines 1010-1047

```tsx
{imprint.mockups && imprint.mockups.length > 0 ? (
  <>
    {imprint.mockups.slice(0, 2).map((mockup, idx) => (
      <button onClick={() => onImageClick?.(allMockups, idx)}>
        <img src={mockup.thumbnail_url || mockup.url} />
      </button>
    ))}
    {imprint.mockups.length > 2 && (
      <span>+{imprint.mockups.length - 2}</span>
    )}
  </>
)}
```

**Display:** 7×7 thumbnails, max 2 shown with "+N" overflow indicator

### 2.3 Production Files Section

**Location:** Lines 1321-1419

```tsx
{/* Image Files with Previews */}
<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
  {imageFiles.map((file, idx) => (
    <button onClick={() => openImageModal(imageFiles, idx)}>
      <img src={file.url} />
    </button>
  ))}
</div>

{/* PDF Files with Thumbnails */}
<div className="flex flex-wrap gap-2">
  {pdfFiles.map((file) => (
    <PdfThumbnail
      thumbnailUrl={file.thumbnail_url}
      pdfUrl={file.url}
      name={file.name}
    />
  ))}
</div>
```

**Display:** Image grid (responsive columns), PDF thumbnails with "View PDF" fallback

### 2.4 Image Modal

**Component:** `ImageModal` (shared component)
**Location:** Line 1450-1456

```tsx
<ImageModal
  images={modalImages}
  currentIndex={modalIndex}
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onNavigate={setModalIndex}
/>
```

**Features:** Full-screen view, navigation arrows, close button

---

## 3. Data Flow Analysis

### API → Hook → Component

```
API: GET /api/orders/{visualId}
        │
        ▼
Hook: useOrderDetail(visualId)  [hooks.ts:284-481]
├── Fetches from API
├── Maps snake_case → camelCase
├── Adds mock imprints if none exist (testing only!)
└── Returns: { order, loading, error, refetch }
        │
        ▼
Component: OrderDetailPage
├── order.customer → Customer info bar
├── order.lineItems → LineItemsTable
│   ├── item.sizes → Size columns
│   ├── item.mockup → Line item thumbnail
│   └── item.imprints → Expandable imprint rows
│       ├── imprint.location
│       ├── imprint.decorationType
│       ├── imprint.colors
│       └── imprint.mockups → Imprint thumbnails
├── order.artworkFiles → Production files section
├── order.productionNotes → Production notes card
└── order.notes → Notes card
```

### Type Definitions (hooks.ts)

```typescript
interface OrderDetail {
  id: number
  orderNumber: string
  orderNickname: string | null
  status: string
  totalAmount: number
  amountOutstanding: number
  dueDate: string | null
  customer: OrderDetailCustomer
  lineItems: OrderDetailLineItem[]
  artworkFiles: OrderDetailArtwork[]
  productionNotes: string | null
  notes: string | null
}

interface OrderDetailLineItem {
  id: number
  styleNumber: string | null
  description: string | null
  color: string | null
  unitCost: number
  totalQuantity: number
  sizes: { xs, s, m, l, xl, xxl, xxxl, xxxxl, xxxxxl, other }
  mockup: LineItemMockup | null
  imprints: LineItemImprint[]
}

interface LineItemImprint {
  id: number
  location: string | null
  decorationType: string | null
  description: string | null
  colorCount: number | null
  colors: string | null
  width: number | null
  height: number | null
  mockups: LineItemMockup[]
}
```

---

## 4. Edit Functionality Patterns

### 4.1 Inline Cell Editing (LineItemsTable)

**State Management:**
```typescript
const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
const [editedItems, setEditedItems] = useState<Record<string, Partial<OrderDetailLineItem>>>({})
```

**Editable Fields:**
- `styleNumber` - Item/SKU number
- `color` - Color name
- `description` - Product description
- `unitCost` - Price per unit
- `size-{XS|S|M|...}` - Size quantities

**Behavior:**
1. Click cell → Shows input field
2. Type → Updates local state
3. Enter/blur → Shows toast "Cell updated"
4. Escape → Cancels edit

**⚠️ Issue:** Changes are local only, no API persistence!

### 4.2 Imprint Cell Editing

**State:**
```typescript
const [editingImprintCell, setEditingImprintCell] = useState<EditingImprintCell | null>(null)
const [editedImprints, setEditedImprints] = useState<Record<number, Partial<LineItemImprint>>>({})
```

**Editable Fields:**
- `description`
- `location`
- `colors`
- `colorCount`, `width`, `height`

### 4.3 Add Line Item Dialog

**Trigger:** "Add Line Item" button (Line 1307-1315)
**Fields:** Description*, Style Number, Color, Unit Cost
**⚠️ Issue:** Only shows toast, doesn't actually add to order

### 4.4 Add Imprint Dialog

**Trigger:** "Add Imprint" button in LineItemCard
**Fields:** Location*, Type, Description, Colors
**⚠️ Issue:** Only shows toast, doesn't actually add to line item

---

## 5. Missing Features (vs PrintShopPro Reference)

### Header Actions (Empty dropdown at Line 1214-1222)

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Edit Order | ✅ Opens full editor | ❌ Empty dropdown | High |
| Duplicate Order | ✅ Creates copy | ❌ Missing | Medium |
| Print Order | ✅ Print view | ❌ Missing | Low |
| Export PDF | ✅ PDF download | ❌ Missing | Low |
| Delete Order | ✅ With confirmation | ❌ Missing | Low |
| Change Status | ✅ Status dropdown | ❌ Missing | High |

### Quote Builder Integration

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Approve Quote | ✅ Button when status=QUOTE | ❌ Missing | High |
| Send Quote Email | ✅ Email integration | ❌ Missing | Medium |
| Request Changes | ✅ Customer feedback | ❌ Missing | Medium |

### Line Item Actions

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Duplicate Item | ✅ In dropdown | ⚠️ Toast only | Medium |
| Delete Item | ✅ With confirmation | ⚠️ Toast only | Medium |
| Reorder Items | ✅ Drag and drop | ❌ Missing | Low |
| Bulk Edit | ✅ Select multiple | ❌ Missing | Low |

### Other Missing

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Activity Timeline | ✅ Shows history | ❌ Missing | Medium |
| Payment Recording | ✅ Add payment | ❌ Missing | High |
| Customer Quick Edit | ✅ Edit from order | ❌ Missing | Low |
| Related Orders | ✅ Customer's orders | ❌ Missing | Low |

---

## 6. PDF Mockup Handling

### PdfThumbnail Component (Lines 51-130)

**Logic Flow:**
```
1. Check if thumbnailUrl exists and hasn't failed
   ↓ YES                    ↓ NO
2a. Try to load image      2b. Show fallback
   ↓ SUCCESS    ↓ FAIL
3a. Show img   3b. Set thumbnailFailed=true → Show fallback
```

**Fallback Display:**
```tsx
<a href={pdfUrl} target="_blank">
  <FilePdf icon />
  <span>View PDF</span>
</a>
```

**Size Options:**
- `small`: 16×16 (w-16 h-16)
- `large`: 24×24 (w-24 h-24)

### isPdfUrl Helper (Line 133-136)

```typescript
function isPdfUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf');
}
```

---

## 7. Component Hierarchy

```
OrderDetailPage
├── Header Section
│   ├── Order number + nickname
│   ├── Status badge
│   ├── Total amount + balance
│   └── DropdownMenu (empty)
│
├── Card: Customer Info Bar
│   ├── Customer name (clickable → onViewCustomer)
│   ├── Company
│   ├── Email + Phone links
│   └── Created + Due dates
│
├── Card: Line Items
│   ├── LineItemsTable
│   │   ├── Table header with column visibility
│   │   └── For each item:
│   │       ├── Main row (expandable)
│   │       └── Imprint rows (when expanded)
│   └── "Add Line Item" button
│
├── Card: Production Files (conditional)
│   ├── Images grid
│   ├── PDFs with thumbnails
│   └── Other files list
│
├── Card: Production Notes (conditional)
│   └── HTML content via dangerouslySetInnerHTML
│
├── Card: Notes (conditional)
│   └── Plain text
│
├── ImageModal (for full-screen viewing)
└── AddLineItemDialog
```

---

## 8. State Management Summary

| State | Type | Purpose |
|-------|------|---------|
| `modalOpen` | boolean | Image modal visibility |
| `modalImages` | Array | Images for modal gallery |
| `modalIndex` | number | Current image in modal |
| `addLineItemOpen` | boolean | Add line item dialog |
| `columnConfig` | ColumnConfig | Table column visibility (persisted via useKV) |

### LineItemsTable Internal State

| State | Type | Purpose |
|-------|------|---------|
| `columnConfig` | ColumnConfig | Column visibility |
| `editingCell` | EditingCell | Currently editing cell |
| `editingImprintCell` | EditingImprintCell | Currently editing imprint cell |
| `editedItems` | Record | Local edits to line items |
| `editedImprints` | Record | Local edits to imprints |
| `expandedItems` | Set<number> | Which items are expanded |

---

## 9. Known Issues

### 9.1 Mock Data Injection (hooks.ts:367-418)

**Problem:** If API returns no imprints, hook injects placeholder data:

```typescript
if (imprints.length === 0) {
  console.log('⚠️ No imprints in API data, adding mock imprint for testing');
  imprints = [/* mock data */];
}
```

**Impact:** Users may see fake data in production
**Fix:** Remove mock injection, show empty state instead

### 9.2 Edits Not Persisted

**Problem:** All inline edits (cells, imprints) only update local state
**Impact:** Changes lost on refresh
**Fix:** Wire to API PATCH endpoints

### 9.3 Empty Dropdown Menu (Line 1214-1222)

```tsx
<DropdownMenuContent align="end">
  {/* Empty! No items */}
</DropdownMenuContent>
```

**Fix:** Add Edit, Duplicate, Print, Delete actions

### 9.4 Add Dialogs Toast Only

**Problem:** AddLineItemDialog and AddImprintDialog show success toast but don't persist:

```typescript
const handleAddLineItem = (lineItem: Partial<OrderDetailLineItem>) => {
  toast.success(`Line item "${lineItem.description}" added`);
  // In a real implementation, this would add the line item to the order
};
```

---

## 10. Files Summary

| File | Lines | Status | Purpose |
|------|-------|--------|---------|
| `OrderDetailPage.tsx` | 2029 | Active | Main order detail view |
| `OrderDetail.tsx` | 928 | Legacy | Card-based layout (not in use) |
| `hooks.ts` (useOrderDetail) | ~200 | Active | Data fetching and transformation |
| `ManageColumnsModal.tsx` | - | Active | Column visibility settings |
| `ImageModal.tsx` | - | Shared | Full-screen image viewer |

---

## 11. Recommendations for v2.2.0

### High Priority
1. **Wire Edit Actions** - Add dropdown menu items for Edit, Status Change
2. **Remove Mock Data** - Stop injecting fake imprints in hook
3. **Persist Inline Edits** - Wire cell changes to API

### Medium Priority
4. **Payment Recording** - Add "Record Payment" functionality
5. **Quote Approval** - Show approve button when status is QUOTE
6. **Activity Timeline** - Show order history/changes

### Low Priority
7. **Print/Export** - Add print view and PDF export
8. **Bulk Actions** - Multi-select line items for bulk operations
9. **Drag Reorder** - Allow reordering line items

---

## 12. New Order Button Location

**Found in:** `App.tsx` Line 329-334

```tsx
<Button variant="default" size="sm" className="gap-2 h-8">
  <svg className="w-4 h-4">...</svg>
  New Order
</Button>
```

**Location:** Header, right side, always visible
**Status:** Button exists but no onClick handler (UI only)
