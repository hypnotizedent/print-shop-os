# Order Detail UI Implementation Plan (v2.2.0)

> Created: December 22, 2025
> Based on: DIAG_ORDER_DETAIL_PAGE.md audit

---

## Critical Issue: Edits Don't Persist

The current page has inline editing that appears to work but **saves nothing**. All changes are lost on refresh.

### Current Edit Actions (All Broken)

| Edit Action | UI Result | Actual Result | API Needed |
|-------------|-----------|---------------|------------|
| Edit style/color | Shows input, accepts text | Local state only | `PUT /api/orders/:id/line-items/:itemId` |
| Edit sizes | Shows number input | Local state only | `PUT /api/orders/:id/line-items/:itemId` |
| Edit unit price | Shows number input | Local state only | `PUT /api/orders/:id/line-items/:itemId` |
| Edit imprint location | Shows input | Local state only | `PUT /api/orders/:id/imprints/:imprintId` |
| Edit imprint colors | Shows input | Local state only | `PUT /api/orders/:id/imprints/:imprintId` |
| Add Line Item | Toast "added" | Nothing saved | `POST /api/orders/:id/line-items` |
| Add Imprint | Toast "added" | Nothing saved | `POST /api/orders/:id/line-items/:itemId/imprints` |
| Delete Line Item | Toast "deleted" | Nothing saved | `DELETE /api/orders/:id/line-items/:itemId` |
| Delete Imprint | Toast "deleted" | Nothing saved | `DELETE /api/orders/:id/imprints/:imprintId` |

### Code Locations

```
OrderDetailPage.tsx:
├── Line 584: editedItems state (never sent to API)
├── Line 585: editedImprints state (never sent to API)
├── Line 668-673: handleCellBlur → toast.success only
├── Line 720-725: handleImprintCellBlur → toast.success only
├── Line 1105-1108: handleAddLineItem → toast.success only
└── Line 1729: handleAddImprint → toast.success only

hooks.ts:
└── No mutation functions exist (only read)
```

---

## Phase 1: View Mode vs Edit Mode

### Current Problem

The page is always in "edit mode" - clicking any cell immediately shows an input. This is:
- Confusing (users don't know if changes save)
- Error-prone (accidental edits)
- Missing clear save/cancel actions

### Proposed Solution

```
┌─────────────────────────────────────────────────────────┐
│ VIEW MODE (Default)                                      │
│ - All cells display text only                           │
│ - No inputs visible                                     │
│ - Clean, read-only display                              │
│ - Header shows [Edit Order] button                      │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Click "Edit Order"
                    ▼
┌─────────────────────────────────────────────────────────┐
│ EDIT MODE                                                │
│ - Cells become clickable/editable                       │
│ - Visual indicator (border color, background)           │
│ - Header shows [Save] [Cancel] buttons                  │
│ - "Unsaved changes" warning on navigation               │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Click "Save"
                    ▼
┌─────────────────────────────────────────────────────────┐
│ SAVING STATE                                             │
│ - Show loading spinner                                  │
│ - Disable all inputs                                    │
│ - Call API endpoints                                    │
│ - On success → Return to View Mode                      │
│ - On error → Show error, stay in Edit Mode              │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

1. Add `isEditing` state to OrderDetailPage
2. Add "Edit Order" button to header dropdown menu
3. Wrap editable cells with `{isEditing && ...}` conditions
4. Add Save/Cancel button bar (sticky at bottom when editing)
5. Implement `handleSave` that batches all changes to API
6. Add unsaved changes warning via `beforeunload` event

### State Changes

```typescript
// Add to OrderDetailPage
const [isEditing, setIsEditing] = useState(false);
const [hasChanges, setHasChanges] = useState(false);
const [isSaving, setIsSaving] = useState(false);

// Modify cell handlers
const handleCellChange = (value: string) => {
  // ... existing logic
  setHasChanges(true);  // Mark as dirty
};

// Add save handler
const handleSave = async () => {
  setIsSaving(true);
  try {
    // Batch API calls for all editedItems
    // Batch API calls for all editedImprints
    await Promise.all([...itemCalls, ...imprintCalls]);
    setIsEditing(false);
    setHasChanges(false);
    toast.success('Order saved');
    refetch();  // Reload fresh data
  } catch (error) {
    toast.error('Failed to save changes');
  } finally {
    setIsSaving(false);
  }
};
```

---

## Phase 2: Fix New Order Button

### Current State

`App.tsx` Line 329-334:
```tsx
<Button variant="default" size="sm" className="gap-2 h-8">
  <svg>...</svg>
  New Order
</Button>
// No onClick handler!
```

### Option A: Route to Quote Builder v2

Quote Builder already has full order creation flow. Simply add navigation:

```tsx
<Button
  onClick={() => setCurrentView('quote-builder')}  // or router.push('/quote-builder')
>
  New Order
</Button>
```

**Pros:** Leverages existing feature, no new code needed
**Cons:** May not match user expectations if they expect inline creation

### Option B: New Order Modal

Create a simplified order creation modal:

```
┌─────────────────────────────────────────────────────┐
│ Create New Order                              [X]   │
├─────────────────────────────────────────────────────┤
│ Customer *                                          │
│ [Select or search customer...        ▼]            │
│                                                     │
│ Order Nickname                                      │
│ [                                      ]            │
│                                                     │
│ Due Date                                            │
│ [                                      📅]          │
│                                                     │
│ Notes                                               │
│ [                                      ]            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                        [Cancel]  [Create Order]     │
└─────────────────────────────────────────────────────┘
```

**Steps:**
1. Create `NewOrderModal` component
2. Add customer search/select (typeahead with existing customers)
3. Submit → `POST /api/orders`
4. On success → Navigate to new order detail page

### Option C: New Order Page

Full-page order creation with line item builder. More complex but gives full control.

### Recommendation

**Start with Option A** (route to Quote Builder) as immediate fix, then evaluate if Option B modal is needed based on user feedback.

---

## Phase 3: Wire Edit Saves to API

### Required API Endpoints

```
Orders:
PUT    /api/orders/:id                    - Update order fields
DELETE /api/orders/:id                    - Delete order

Line Items:
POST   /api/orders/:id/line-items         - Add line item
PUT    /api/orders/:id/line-items/:itemId - Update line item
DELETE /api/orders/:id/line-items/:itemId - Delete line item

Imprints:
POST   /api/orders/:id/line-items/:itemId/imprints         - Add imprint
PUT    /api/orders/:id/imprints/:imprintId                 - Update imprint
DELETE /api/orders/:id/imprints/:imprintId                 - Delete imprint

Mockups:
POST   /api/orders/:id/mockups            - Upload mockup (multipart)
DELETE /api/orders/:id/mockups/:mockupId  - Delete mockup
```

### API Adapter Functions Needed

Add to `api-adapter.ts`:

```typescript
// Order mutations
export async function updateOrder(orderId: string, data: Partial<Order>): Promise<Order>
export async function deleteOrder(orderId: string): Promise<void>

// Line item mutations
export async function addLineItem(orderId: string, data: NewLineItem): Promise<LineItem>
export async function updateLineItem(orderId: string, itemId: string, data: Partial<LineItem>): Promise<LineItem>
export async function deleteLineItem(orderId: string, itemId: string): Promise<void>

// Imprint mutations
export async function addImprint(orderId: string, itemId: string, data: NewImprint): Promise<Imprint>
export async function updateImprint(orderId: string, imprintId: string, data: Partial<Imprint>): Promise<Imprint>
export async function deleteImprint(orderId: string, imprintId: string): Promise<void>

// Mockup uploads
export async function uploadMockup(orderId: string, file: File, options?: UploadOptions): Promise<Mockup>
export async function deleteMockup(orderId: string, mockupId: string): Promise<void>
```

### Hooks Needed

Add to `hooks.ts`:

```typescript
// Mutation hook for line items
export function useLineItemMutation(orderId: string) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const add = async (data: NewLineItem) => { ... };
  const update = async (itemId: string, data: Partial<LineItem>) => { ... };
  const remove = async (itemId: string) => { ... };

  return { add, update, remove, saving, error };
}

// Similar for imprints, mockups
```

### Save Strategy

**Option A: Save on blur (immediate)**
- Each cell change saves immediately
- Pros: No "Save" button needed, always in sync
- Cons: Many API calls, potential for partial failures

**Option B: Batch save (recommended)**
- Collect all changes in local state
- Single "Save" button sends all changes
- Pros: Fewer API calls, atomic save
- Cons: Users must remember to save

**Option C: Auto-save with debounce**
- Save changes after 2s of inactivity
- Pros: Best of both worlds
- Cons: Complex to implement well

### Recommendation

Start with **Option B (batch save)** for simplicity, then add auto-save debounce in future iteration.

---

## Phase 4: Status Workflow

### Current Status Display

Line 1199-1204:
```tsx
<Badge className={`${getAPIStatusColor(order.status)} ...`}>
  {getAPIStatusLabel(order.status)}
</Badge>
```

Status badge is display-only. No way to change status.

### Status Flow Diagram

```
                    ┌──────────────────┐
                    │      DRAFT       │
                    └────────┬─────────┘
                             │ "Submit Quote"
                             ▼
                    ┌──────────────────┐
                    │      QUOTE       │◄─────┐
                    └────────┬─────────┘      │
                             │                │ "Request Changes"
          ┌──────────────────┼──────────────┐│
          │ "Approve"        │ "Reject"     ││
          ▼                  ▼              ││
┌──────────────────┐ ┌──────────────┐       ││
│ QUOTE APPROVED   │ │  CANCELLED   │       ││
└────────┬─────────┘ └──────────────┘       ││
         │                                   ││
         │ "Start Production"                ││
         ▼                                   ││
┌──────────────────┐                         ││
│  IN PRODUCTION   │─────────────────────────┘│
└────────┬─────────┘  (can request changes)   │
         │                                    │
         │ "Complete"                         │
         ▼                                    │
┌──────────────────┐                          │
│    COMPLETE      │──────────────────────────┘
└──────────────────┘  (can reopen for changes)
```

### UI Implementation

**Add to header dropdown:**
```tsx
<DropdownMenuContent>
  {order.status === 'QUOTE' && (
    <>
      <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
        <Check /> Approve Quote
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
        <X /> Reject Quote
      </DropdownMenuItem>
    </>
  )}
  {order.status === 'approved' && (
    <DropdownMenuItem onClick={() => handleStatusChange('in_production')}>
      <Printer /> Start Production
    </DropdownMenuItem>
  )}
  {/* etc */}
</DropdownMenuContent>
```

**Or add status buttons below header:**
```tsx
{order.status === 'QUOTE' && (
  <div className="flex gap-2 mt-2">
    <Button variant="default" onClick={() => handleStatusChange('approved')}>
      Approve Quote
    </Button>
    <Button variant="outline" onClick={() => handleStatusChange('cancelled')}>
      Reject
    </Button>
  </div>
)}
```

### API Endpoint

```
PUT /api/orders/:id/status
Body: { status: "approved" | "in_production" | "complete" | ... }
```

---

## Phase 5: Customer Sharing

### Current State

No sharing functionality exists.

### Proposed Feature

Add "Share with Customer" button that generates a secure, read-only link.

### UI Flow

```
1. Click "Share" button in header
          ▼
┌─────────────────────────────────────────────────┐
│ Share Order #13689                        [X]   │
├─────────────────────────────────────────────────┤
│                                                 │
│ Share this link with your customer:             │
│ ┌─────────────────────────────────────────────┐ │
│ │ https://app.mintprints.com/share/abc123...  │ │
│ └─────────────────────────────────────────────┘ │
│                                [Copy Link]      │
│                                                 │
│ Link expires: Never / 7 days / 30 days  [▼]    │
│                                                 │
│ ☐ Require email to view                        │
│ ☐ Allow customer to approve                    │
│                                                 │
├─────────────────────────────────────────────────┤
│ Or send via email:                              │
│ [customer@email.com          ]  [Send Email]   │
└─────────────────────────────────────────────────┘
```

### API Endpoints

```
POST /api/orders/:id/share
Body: { expiresIn?: '7d' | '30d' | 'never', requireEmail?: boolean }
Returns: { shareUrl: string, shareToken: string }

GET /api/share/:token  (public endpoint)
Returns: Order data (limited fields for customer view)
```

---

## Component Refactor Recommendation

### Current State

`OrderDetailPage.tsx` is **2029 lines** - too large for maintainability.

### Proposed Structure

```
src/components/orders/
├── OrderDetailPage.tsx          (main container, ~200 lines)
├── detail/
│   ├── OrderHeader.tsx          (title, status, actions ~150 lines)
│   ├── CustomerInfoBar.tsx      (customer details ~100 lines)
│   ├── LineItemsSection.tsx     (container for table ~100 lines)
│   ├── LineItemsTable.tsx       (table component ~400 lines)
│   ├── LineItemRow.tsx          (single row ~150 lines)
│   ├── ImprintRow.tsx           (imprint sub-row ~100 lines)
│   ├── ProductionFiles.tsx      (files section ~150 lines)
│   ├── NotesSection.tsx         (production notes + notes ~80 lines)
│   └── OrderActions.tsx         (floating action bar ~100 lines)
├── dialogs/
│   ├── AddLineItemDialog.tsx    (existing, extract)
│   ├── AddImprintDialog.tsx     (existing, extract)
│   ├── MockupUploadDialog.tsx   (existing, extract)
│   └── ShareOrderDialog.tsx     (new)
└── hooks/
    ├── useOrderDetail.ts        (move from hooks.ts)
    ├── useLineItemMutation.ts   (new)
    └── useOrderMutation.ts      (new)
```

### Extraction Priority

1. **High**: `LineItemsTable` (500+ lines) → separate file
2. **High**: Dialogs (300+ lines total) → `dialogs/` folder
3. **Medium**: `PdfThumbnail` → `shared/PdfThumbnail.tsx`
4. **Medium**: `ImprintCard` → `detail/ImprintRow.tsx`
5. **Low**: Header section → `detail/OrderHeader.tsx`

---

## Remove Mock Data Injection

### Current Problem

`hooks.ts` lines 367-418 inject fake imprints when API returns none:

```typescript
if (imprints.length === 0) {
  console.log('⚠️ No imprints in API data, adding mock imprint for testing');
  imprints = [
    { id: 99999, location: 'Front', ... },
    { id: 99998, location: 'Back', ... }
  ];
}
```

### Why This Is Bad

1. Users see fake data they didn't create
2. IDs 99999/99998 could conflict with real data
3. console.log pollution in production
4. Hides actual API issues

### Fix

```typescript
// REMOVE the entire if block (lines 367-418)
// Replace with:
// (no replacement needed - just use empty array)
```

### Also Remove Mock Line Item Mockup

Lines 420-431:
```typescript
const mockup = li.mockup ? { ... } : {
  id: 'mock-lineitem',
  url: 'https://via.placeholder.com/...',
  ...
};
```

**Fix:** Return `null` instead of mock:
```typescript
const mockup = li.mockup ? { ... } : null;
```

---

## Implementation Timeline

| Phase | Description | Dependencies | Complexity |
|-------|-------------|--------------|------------|
| 0 | Remove mock data injection | None | Low |
| 1 | View/Edit mode toggle | None | Medium |
| 2 | Fix New Order button | Phase 1 | Low |
| 3 | Wire saves to API | API endpoints, Phase 1 | High |
| 4 | Status workflow | API endpoints | Medium |
| 5 | Customer sharing | API endpoints | Medium |
| 6 | Component refactor | Phases 1-5 complete | Medium |

### Suggested Order

1. **Phase 0** - Quick win, removes confusion
2. **Phase 2** - Quick win, completes navigation
3. **Phase 1** - Required before Phase 3
4. **Phase 3** - Core functionality fix
5. **Phase 4** - Workflow enhancement
6. **Phase 5** - Nice-to-have feature
7. **Phase 6** - Cleanup for maintainability

---

## API Dependencies

Before Phase 3-5 can proceed, backend needs these endpoints:

### Required (Phase 3)

- [ ] `PUT /api/orders/:id` - Update order
- [ ] `POST /api/orders/:id/line-items` - Add line item
- [ ] `PUT /api/orders/:id/line-items/:itemId` - Update line item
- [ ] `DELETE /api/orders/:id/line-items/:itemId` - Delete line item
- [ ] `POST /api/orders/:id/line-items/:itemId/imprints` - Add imprint
- [ ] `PUT /api/orders/:id/imprints/:imprintId` - Update imprint
- [ ] `DELETE /api/orders/:id/imprints/:imprintId` - Delete imprint

### Required (Phase 4)

- [ ] `PUT /api/orders/:id/status` - Change order status

### Required (Phase 5)

- [ ] `POST /api/orders/:id/share` - Generate share link
- [ ] `GET /api/share/:token` - Public order view

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Order opens in read-only view mode
- [ ] "Edit Order" button visible in dropdown
- [ ] Clicking "Edit" enables inline editing
- [ ] Save/Cancel buttons appear when editing
- [ ] Canceling discards changes
- [ ] Unsaved changes warning works

### Phase 3 Complete When:
- [ ] Editing a cell and saving persists to database
- [ ] Adding line item creates real database record
- [ ] Deleting line item removes from database
- [ ] Adding/editing imprints saves correctly
- [ ] Error handling shows user-friendly messages
- [ ] Loading states shown during saves

### Full v2.2.0 Complete When:
- [ ] All phases implemented
- [ ] No mock data in production
- [ ] OrderDetailPage.tsx under 300 lines
- [ ] All API mutations tested
- [ ] No console errors or warnings
