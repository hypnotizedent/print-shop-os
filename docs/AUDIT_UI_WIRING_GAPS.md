# Audit: UI Wiring Gaps & PrintShopPro Components

**Date:** December 22, 2025
**Version:** v2.2.1

---

## Summary

This audit identifies:
1. UI elements that exist but don't persist to the backend
2. PrintShopPro components worth porting to ui-v3
3. API endpoints needed for full functionality

---

## Buttons/Actions Needing Wiring

### OrderDetailPage.tsx - CRITICAL

| Handler | Line | Current Behavior | API Endpoint Needed |
|---------|------|------------------|---------------------|
| `handleSave` (imprint) | 1532 | Shows toast only | `PUT /api/orders/:id/imprints/:id` |
| `handleDelete` (imprint) | 1542 | Shows toast only | `DELETE /api/orders/:id/imprints/:id` |
| `handleAddLineItem` | 1135 | Shows toast only | `POST /api/orders/:id/line-items` |
| `handleSave` (line item) | 1748 | Shows toast only | `PUT /api/orders/:id/line-items/:id` |
| `handleDelete` (line item) | 1738 | Shows toast only | `DELETE /api/orders/:id/line-items/:id` |
| `handleDuplicate` | 1734 | Shows toast only | `POST /api/orders/:id/line-items` (with copy) |
| `handleMockupUpload` | 1546, 1764 | Shows toast only | `POST /api/orders/:id/artwork` |
| `handleAddImprint` | 1769 | Shows toast only | `POST /api/orders/:id/line-items/:id/imprints` |

**Evidence:**
```typescript
// Line 1532-1534
const handleSave = () => {
  toast.success('Imprint updated');
  setIsEditing(false);
};

// Line 1135-1138
const handleAddLineItem = (lineItem: Partial<OrderDetailLineItem>) => {
  toast.success(`Line item "${lineItem.description}" added`);
  // In a real implementation, this would add the line item to the order
};
```

### CustomerDetailPage.tsx - HIGH

| Handler | Line | Current Behavior | API Endpoint Needed |
|---------|------|------------------|---------------------|
| `handleSaveContact` | 164 | Shows alert "not yet persisted" | `PUT /api/customers/:id` |
| `handleSaveAddress` | 182 | Shows alert "not yet persisted" | `PUT /api/customers/:id` |

**Evidence:**
```typescript
// Line 164-165
console.log('Saving contact info:', contactInfo);
alert('Note: Contact changes are displayed but not yet persisted to the database. API integration needed.');
```

### Missing Features (No Handler Exists)

| Feature | Location | What's Needed |
|---------|----------|---------------|
| Status change dropdown | OrderDetailPage | Add `<Select>` for status + `PATCH /api/orders/:id/status` |
| New customer from quote | QuoteBuilderPage | Add modal + `POST /api/customers` |
| Send quote to customer | OrderDetailPage | Add button + `POST /api/orders/:id/share` |
| Bulk line item edit | OrderDetailPage | Add selection + batch update UI |

---

## PrintShopPro Components to Port

### Priority Order

| # | Component | Lines | What It Does | Priority | Effort |
|---|-----------|-------|--------------|----------|--------|
| 1 | Status Select Pattern | ~20 | Dropdown to change order status | **HIGH** | 1h |
| 2 | ArtworkUpload.tsx | 242 | Drag-drop file upload with preview | **HIGH** | 3h |
| 3 | PricingSummary.tsx | 115 | Pricing breakdown display | **MEDIUM** | 1h |
| 4 | LineItemGrid.tsx | 1,161 | Full line item editor with sizes | **HIGH** | 6h |
| 5 | DecorationManager.tsx | 1,319 | Imprint/decoration editing | **MEDIUM** | 6h |
| 6 | CustomerArtworkLibrary.tsx | 895 | Customer's saved artwork | **LOW** | 4h |
| 7 | ProductMockup.tsx | 361 | SVG product visualization | **LOW** | 2h |

### Component Details

#### 1. Status Select Pattern (from JobDetail.tsx:386-400)
```typescript
<Select value={job.status} onValueChange={(value) => onUpdateStatus(value as JobStatus)}>
  <SelectTrigger className="w-full h-8">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="art-approval">Art Approval</SelectItem>
    <SelectItem value="scheduled">Scheduled</SelectItem>
    <SelectItem value="printing">Printing</SelectItem>
    <SelectItem value="finishing">Finishing</SelectItem>
    <SelectItem value="ready">Ready</SelectItem>
    <SelectItem value="shipped">Shipped</SelectItem>
    <SelectItem value="delivered">Delivered</SelectItem>
  </SelectContent>
</Select>
```

#### 2. ArtworkUpload.tsx
- Drag-drop file upload
- File type validation (images only)
- File size formatting
- Multiple file support
- Approval workflow integration
- Preview with remove option

**Props:**
```typescript
interface ArtworkUploadProps {
  location: string
  artwork?: LegacyArtworkFile
  onUpload: (artwork: LegacyArtworkFile) => void
  onRemove: () => void
  canApprove?: boolean
  onApprove?: (approved: boolean) => void
  allowMultiple?: boolean
  onBulkUpload?: (artworks: LegacyArtworkFile[]) => void
}
```

#### 3. LineItemGrid.tsx
- Full editable grid for line items
- Size quantity inputs
- Inline price editing
- Add/remove rows
- Drag to reorder
- Group by category

---

## API Endpoints Status

### Existing Endpoints (ronny-ops)

| Endpoint | Method | Status | UI Wired |
|----------|--------|--------|----------|
| `/api/orders` | GET | ✅ Working | ✅ Yes |
| `/api/orders/:id` | GET | ✅ Working | ✅ Yes |
| `/api/customers` | GET | ✅ Working | ✅ Yes |
| `/api/customers/:id` | GET | ✅ Working | ✅ Yes |
| `/api/v2/quotes` | GET | ✅ Working | ✅ Yes |
| `/api/v2/quotes/:id` | GET | ✅ Working | ✅ Yes |
| `/api/v2/quotes` | POST | ✅ Working | ✅ Yes |
| `/api/v2/quotes/:id/convert` | POST | ✅ Working | ✅ Yes |

### Endpoints Needed (create in ronny-ops)

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/orders/:id/status` | PATCH | Change order status | **HIGH** |
| `/api/orders/:id/line-items` | POST | Add line item | **HIGH** |
| `/api/orders/:id/line-items/:id` | PUT | Update line item | **HIGH** |
| `/api/orders/:id/line-items/:id` | DELETE | Remove line item | **HIGH** |
| `/api/orders/:id/artwork` | POST | Upload artwork/mockup | **HIGH** |
| `/api/orders/:id/imprints/:id` | PUT | Update imprint | **MEDIUM** |
| `/api/orders/:id/imprints/:id` | DELETE | Remove imprint | **MEDIUM** |
| `/api/customers/:id` | PUT | Update customer | **HIGH** |
| `/api/customers` | POST | Create customer | **HIGH** |
| `/api/orders/:id/share` | POST | Send to customer | **LOW** |

---

## Recommended Implementation Order

### Phase 1: Quick Wins (This Week)

1. **Add Status Dropdown to OrderDetailPage**
   - Port Select pattern from JobDetail.tsx
   - Create `PATCH /api/orders/:id/status` endpoint
   - Wire up with optimistic update
   - Estimated: 2-3 hours total

2. **Wire Customer Save**
   - Create `PUT /api/customers/:id` endpoint
   - Update CustomerDetailPage handlers
   - Estimated: 2 hours total

### Phase 2: Core Functionality (Next Week)

3. **Line Item CRUD**
   - Create POST/PUT/DELETE endpoints for line items
   - Wire existing UI handlers to API
   - Add loading states
   - Estimated: 4-5 hours total

4. **Port ArtworkUpload Component**
   - Copy and adapt ArtworkUpload.tsx
   - Create upload endpoint with MinIO integration
   - Wire to OrderDetailPage
   - Estimated: 4-5 hours total

### Phase 3: Advanced Features (Later)

5. **Imprint Management**
   - Create imprint CRUD endpoints
   - Wire existing imprint handlers
   - Consider porting DecorationManager.tsx
   - Estimated: 6-8 hours total

6. **New Customer Inline**
   - Add "New Customer" option to customer selectors
   - Create `POST /api/customers` endpoint
   - Modal or inline form
   - Estimated: 3-4 hours total

---

## Files Reference

### ui-v3 Files with Gaps

```
src/components/orders/OrderDetailPage.tsx    # Lines 1135, 1532, 1542, 1734, 1738, 1746, 1764, 1769
src/components/customers/CustomerDetailPage.tsx  # Lines 164, 182
```

### PrintShopPro Files to Reference

```
~/spark/print-shop-pro/src/components/
├── ArtworkUpload.tsx          # 242 lines - drag-drop upload
├── LineItemGrid.tsx           # 1,161 lines - line item editor
├── DecorationManager.tsx      # 1,319 lines - imprint editing
├── JobDetail.tsx              # 709 lines - has status select (line 386)
├── PricingSummary.tsx         # 115 lines - pricing display
├── CustomerArtworkLibrary.tsx # 895 lines - artwork management
└── ProductMockup.tsx          # 361 lines - SVG visualization
```

---

## Success Criteria

- [ ] Status can be changed from order detail page
- [ ] Customer edits persist to database
- [ ] Line items can be added/edited/deleted
- [ ] Artwork can be uploaded to orders
- [ ] No more "not persisted" alerts
- [ ] No toast-only handlers without API calls
