# PrintShopPro Detail Page - Feature Audit

**Date:** December 22, 2025
**Purpose:** Extract ALL features from PrintShopPro's order/quote detail pages for porting to ui-v3

---

## Source Files Analyzed

| File | Lines | Purpose |
|------|-------|---------|
| `JobDetail.tsx` | 709 | Main order/quote detail page |
| `LineItemGrid.tsx` | 1,161 | Line item editing with inline controls |
| `DecorationManager.tsx` | 1,319 | Imprint/decoration management |
| `JobHistory.tsx` | ~200 | Activity log/timeline |
| `InlineSKUSearch.tsx` | ~300 | SKU lookup component |
| `ProductMockup.tsx` | 361 | Mockup display with upload |
| `ArtworkUpload.tsx` | 242 | Drag-drop file upload |

---

## Feature Inventory

### 1. Header Section

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Order # display | `#{visual_id}` large | `#{orderNumber}` | DONE |
| Inline nickname edit | Click to edit, Enter saves | Static display | HIGH |
| Status dropdown | `<Select>` with all statuses | Badge only | HIGH |
| Due date picker | DatePicker component | Static display | MEDIUM |
| More Actions menu | Dropdown with 8+ actions | Missing | HIGH |
| Back button | `← Back to Orders` | Done | DONE |

#### Inline Nickname Editing (JobDetail.tsx:156-189)
```typescript
const [isEditingNickname, setIsEditingNickname] = useState(false);
const [tempNickname, setTempNickname] = useState(job?.order_nickname || '');

// Click to edit
<div onClick={() => setIsEditingNickname(true)}>
  {isEditingNickname ? (
    <Input
      value={tempNickname}
      onChange={(e) => setTempNickname(e.target.value)}
      onBlur={handleSaveNickname}
      onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
      autoFocus
    />
  ) : (
    <span>{job.order_nickname || 'Click to add nickname'}</span>
  )}
</div>
```

#### More Actions Menu (JobDetail.tsx:234-280)
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <DotsThree weight="bold" />
      More Actions
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleDuplicate}>
      <Copy /> Duplicate Order
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handlePrint}>
      <Printer /> Print Work Order
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleSendEmail}>
      <Envelope /> Email Customer
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleArchive}>
      <Archive /> Archive
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
      <Trash /> Delete Order
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 2. Line Items Section

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Inline editing | Direct in table | Popup modal | HIGH |
| SKU column | With search autocomplete | Missing | HIGH |
| Color column | Color picker + text | In description only | MEDIUM |
| Drag-drop reorder | `@dnd-kit/sortable` | Missing | MEDIUM |
| Duplicate line item | Button per row | Missing | HIGH |
| Delete line item | Button per row | Toast only (no API) | HIGH |
| Add line item | "Add Line Item" button | Toast only (no API) | HIGH |
| Quantity grid | XS-3XL inline inputs | Expandable section | DONE |
| Unit price edit | Inline number input | Popup modal | HIGH |
| Line total | Auto-calculated | Shows $0.00 bug | FIXED |
| Groups/sections | Collapsible groups | Missing | LOW |
| Bulk actions | Select multiple + action | Missing | LOW |

#### Inline SKU Search (LineItemGrid.tsx:289-340)
```typescript
<InlineSKUSearch
  value={lineItem.style_number}
  onChange={(sku, product) => {
    updateLineItem(lineItem.id, {
      style_number: sku,
      style_description: product.description,
      color: product.default_color,
      unit_cost: product.base_price
    });
  }}
  placeholder="Enter SKU..."
/>
```

#### Drag-Drop Reordering (LineItemGrid.tsx:78-120)
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

function SortableLineItem({ lineItem, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lineItem.id,
  });

  return (
    <div ref={setNodeRef} style={{ transform, transition }} {...attributes}>
      <div {...listeners} className="cursor-grab">
        <DotsSixVertical />
      </div>
      {/* Line item content */}
    </div>
  );
}
```

#### Duplicate Line Item (LineItemGrid.tsx:445-468)
```typescript
const handleDuplicate = async (lineItem: LineItem) => {
  const newLineItem = {
    ...lineItem,
    id: undefined, // Let API generate new ID
    position: lineItems.length + 1,
  };

  await createLineItem(orderId, newLineItem);
  toast.success('Line item duplicated');
  refetch();
};
```

---

### 3. Imprints/Decorations Section

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Per-line-item imprints | Nested under each line | Separate section | HIGH |
| Imprint card UI | Card with location badge | Basic list | MEDIUM |
| Add imprint button | Per line item | Global only | HIGH |
| Delete imprint | X button on card | Toast only | HIGH |
| Decoration type selector | Dropdown with icons | Basic select | MEDIUM |
| Location presets | Common locations dropdown | Free text | MEDIUM |
| Color count | Number input | Missing | MEDIUM |
| Artwork attachment | File upload per imprint | Missing | HIGH |
| Copy to other items | "Apply to all" button | Missing | MEDIUM |
| Decoration presets | Save/load templates | Missing | LOW |

#### Per-Line-Item Imprints (LineItemGrid.tsx:520-580)
```typescript
{lineItem.imprints?.map((imprint) => (
  <div key={imprint.id} className="ml-8 mt-2 p-3 bg-muted rounded-lg">
    <div className="flex items-center justify-between">
      <Badge variant="outline">{imprint.location}</Badge>
      <span className="text-sm font-medium">{imprint.decoration_type}</span>
      <Button variant="ghost" size="sm" onClick={() => handleDeleteImprint(imprint.id)}>
        <X size={14} />
      </Button>
    </div>
    <p className="text-sm text-muted-foreground mt-1">{imprint.description}</p>
    {imprint.colors && (
      <span className="text-xs">{imprint.colors} colors</span>
    )}
  </div>
))}
<Button variant="ghost" size="sm" onClick={() => handleAddImprint(lineItem.id)}>
  <Plus size={14} /> Add Imprint
</Button>
```

#### Decoration Presets (DecorationManager.tsx:234-290)
```typescript
const DECORATION_PRESETS = [
  { name: 'Front Center', location: 'Front', type: 'Screen Print' },
  { name: 'Back Full', location: 'Back', type: 'Screen Print' },
  { name: 'Left Chest', location: 'Left Chest', type: 'Embroidery' },
  { name: 'Sleeve', location: 'Left Sleeve', type: 'Screen Print' },
];

<Select onValueChange={applyPreset}>
  <SelectTrigger>
    <SelectValue placeholder="Apply preset..." />
  </SelectTrigger>
  <SelectContent>
    {DECORATION_PRESETS.map((preset) => (
      <SelectItem key={preset.name} value={preset.name}>
        {preset.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### 4. Customer Section

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Customer card | Avatar + name + company | Done | DONE |
| Quick contact | Email/phone buttons | Display only | MEDIUM |
| Change customer | Search dropdown | Done | DONE |
| Create new customer | Modal form | Link only | MEDIUM |
| View customer profile | Link to detail | Done | DONE |
| Shipping address | Inline display | Missing | MEDIUM |
| Billing address | Inline display | Missing | MEDIUM |

---

### 5. Mockups/Artwork Section

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Image gallery | Grid with lightbox | Basic grid | DONE |
| Drag-drop upload | ArtworkUpload component | Missing | HIGH |
| PDF detection | Link instead of img | Done | DONE |
| Delete mockup | X button on hover | Missing | HIGH |
| Reorder mockups | Drag-drop | Missing | LOW |
| Zoom/lightbox | Click to enlarge | Missing | MEDIUM |
| Download original | Button | Missing | LOW |

#### Artwork Upload (ArtworkUpload.tsx:45-120)
```typescript
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
  },
  onDrop: async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('order_id', orderId);

      await fetch(`${API_BASE}/api/orders/${orderId}/artwork`, {
        method: 'POST',
        body: formData,
      });
    }
    refetch();
    toast.success(`${acceptedFiles.length} file(s) uploaded`);
  },
});

<div {...getRootProps()} className={cn(
  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
  isDragActive && "border-primary bg-primary/5"
)}>
  <input {...getInputProps()} />
  <Upload className="mx-auto mb-2" />
  <p>Drop files here or click to upload</p>
</div>
```

---

### 6. Footer/Tabs Section

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Activity tab | JobHistory component | Missing | HIGH |
| Notes tab | Rich text notes | Missing | MEDIUM |
| Payments tab | Payment history | Missing | LOW |
| Files tab | All attachments | Missing | LOW |

#### Job History (JobHistory.tsx)
```typescript
interface HistoryEntry {
  id: number;
  action: string;
  user_name: string;
  created_at: string;
  details: string;
}

function JobHistory({ orderId }) {
  const { data: history } = useQuery(['history', orderId], fetchHistory);

  return (
    <div className="space-y-4">
      {history?.map((entry) => (
        <div key={entry.id} className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
          <div>
            <p className="text-sm">
              <span className="font-medium">{entry.user_name}</span>
              {' '}{entry.action}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(entry.created_at))} ago
            </p>
            {entry.details && (
              <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 7. Pricing Section

| Feature | PrintShopPro | ui-v3 | Priority |
|---------|--------------|-------|----------|
| Subtotal | Calculated | Done | DONE |
| Tax rate | Editable | Static | LOW |
| Discount | Amount or % | Missing | MEDIUM |
| Shipping | Editable amount | Missing | MEDIUM |
| Total | Auto-calculated | Done | DONE |
| Payment status | Badge | Missing | MEDIUM |

---

## Component Map

```
PrintShopPro                          ui-v3 (current)
─────────────                         ───────────────
JobDetail.tsx                    →    OrderDetailPage.tsx
├── JobHeader                    →    (inline in OrderDetailPage)
│   ├── InlineNicknameEdit       →    MISSING
│   ├── StatusDropdown           →    Badge only
│   └── MoreActionsMenu          →    MISSING
├── CustomerCard                 →    Customer info bar
├── LineItemGrid.tsx             →    Expandable line items
│   ├── SortableLineItem         →    MISSING (no drag-drop)
│   ├── InlineSKUSearch          →    MISSING
│   ├── SizeQuantityGrid         →    Done (expandable)
│   └── ImprintCards             →    Separate section
├── DecorationManager.tsx        →    Basic imprint list
│   ├── DecorationPresets        →    MISSING
│   └── ArtworkPerImprint        →    MISSING
├── ArtworkGallery               →    MockupsSection
│   └── ArtworkUpload            →    MISSING
├── PricingSummary               →    Done
└── TabsSection                  →    MISSING
    ├── ActivityTab              →    MISSING
    ├── NotesTab                 →    MISSING
    └── PaymentsTab              →    MISSING
```

---

## Styling Comparison

### Line Item Card

**PrintShopPro:**
```typescript
<Card className="p-4 mb-2 hover:shadow-md transition-shadow">
  <div className="flex items-center gap-4">
    <div className="cursor-grab p-2 hover:bg-muted rounded">
      <DotsSixVertical size={20} />
    </div>
    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
      <div className="col-span-3">
        <InlineSKUSearch ... />
      </div>
      <div className="col-span-4">
        <Input value={description} onChange={...} />
      </div>
      <div className="col-span-2">
        <ColorPicker value={color} onChange={...} />
      </div>
      <div className="col-span-1 text-center">
        <span>{totalQty}</span>
      </div>
      <div className="col-span-1">
        <Input type="number" value={unitPrice} ... />
      </div>
      <div className="col-span-1 text-right font-medium">
        ${total.toFixed(2)}
      </div>
    </div>
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={duplicate}>
        <Copy size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={delete}>
        <Trash size={16} />
      </Button>
    </div>
  </div>
  {/* Nested imprints */}
  <div className="ml-12 mt-3 space-y-2">
    {imprints.map(...)}
    <Button variant="ghost" size="sm">+ Add Imprint</Button>
  </div>
</Card>
```

**ui-v3 (current):**
```typescript
<Card className="overflow-hidden">
  <div onClick={toggleExpand} className="cursor-pointer">
    <div className="p-4 flex items-center gap-4">
      {/* Basic info, click to expand */}
    </div>
  </div>
  {isExpanded && (
    <div className="px-4 pb-4">
      {/* Expanded content with edit button → opens modal */}
    </div>
  )}
</Card>
```

---

## Implementation Priority

### Phase 1: Critical (This Week)
1. ~~**Status Dropdown**~~ - ✅ DONE (wired to API)
2. **Inline Line Item Editing** - Replace popup modal with inline
3. ~~**Add/Delete Line Items**~~ - ✅ DONE (wired to API)
4. ~~**Add/Delete Imprints**~~ - ✅ DONE (wired to API)
5. **More Actions Menu** - Basic dropdown (UI only)

### Phase 2: Important (Next Week)
1. **Inline Nickname Edit** - Click to edit
2. **SKU Search** - Autocomplete in line items
3. **Artwork Upload** - Drag-drop component
4. **Per-Line Imprints** - Nest under line items
5. **Activity Tab** - History timeline

### Phase 3: Nice to Have
1. **Drag-Drop Reorder** - Line items
2. **Decoration Presets** - Common locations
3. **Copy Decorations** - Apply to all items
4. **Duplicate Line Item** - Quick copy
5. **Notes Tab** - Rich text

### Phase 4: Future
1. **Groups/Sections** - Collapsible
2. **Bulk Actions** - Multi-select
3. **Payment History** - Tab
4. **Shipping/Billing** - Address management

---

## API Endpoints - Ready to Wire

All endpoints exist in `ronny-ops` dashboard-server.cjs:

| Endpoint | API | UI Wired |
|----------|-----|----------|
| `POST /api/orders/:id/status` | ✅ Line 3364 | ✅ `handleStatusChange` |
| `POST /api/orders/:id/line-items` | ✅ Line 3469 | ✅ `handleAddLineItem` |
| `PUT /api/orders/:id/line-items/:id` | ✅ Line 3545 | ⚠️ Partial (modal save) |
| `DELETE /api/orders/:id/line-items/:id` | ✅ Line 3635 | ⚠️ Needs verify |
| `POST /api/orders/:id/imprints` | ✅ Built Dec 22 | ✅ `handleAddImprintForItem` |
| `PUT /api/orders/:id/imprints/:id` | ✅ Built Dec 22 | ⚠️ Needs inline edit |
| `DELETE /api/orders/:id/imprints/:id` | ✅ Built Dec 22 | ✅ `handleDeleteImprint` |
| `POST /api/orders/:id/artwork` | ✅ Built Dec 22 | ❌ No upload UI |
| `DELETE /api/orders/:id/artwork/:id` | ✅ Built Dec 22 | ❌ No delete UI |

**Priority:** Focus on UI improvements, not API work

---

## Quick Wins (Can Do Today)

1. **Inline Nickname Edit** - Pure frontend, no API needed (save on blur)
2. **More Actions Menu** - Dropdown UI only (actions can show toast for now)
3. **Better Imprint Cards** - Restyle existing imprints with location badges
4. **Size Grid in Table Header** - Show XS|S|M|L|XL columns

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `LineItemRow.tsx` | CREATE | New inline-editable line item component |
| `InlineSKUSearch.tsx` | PORT | SKU autocomplete from PrintShopPro |
| `ImprintCard.tsx` | CREATE | Styled imprint card component |
| `MoreActionsMenu.tsx` | CREATE | Dropdown menu component |
| `ArtworkUpload.tsx` | PORT | Drag-drop upload from PrintShopPro |
| `JobHistory.tsx` | PORT | Activity timeline from PrintShopPro |
| `OrderDetailPage.tsx` | MODIFY | Integrate new components |

---

## Summary

**Total Features Audited:** 45+
**Currently Implemented in ui-v3:** ~20 (more than expected!)
**Missing/Needs Porting:** ~25

**Already Wired to API:**
- Status dropdown ✅ `handleStatusChange`
- Add line item ✅ `handleAddLineItem`
- Add imprint ✅ `handleAddImprintForItem`
- Delete imprint ✅ `handleDeleteImprint`

**UI Improvements Needed (APIs Ready):**
1. Inline line item editing (replace popup modal)
2. Artwork upload component (drag-drop)
3. More Actions menu (duplicate, print, archive)
4. Activity history tab
5. Better imprint card styling
