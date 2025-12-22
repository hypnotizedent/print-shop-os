# API Endpoints Handoff - ronny-ops

> **Created**: December 22, 2025
> **From**: Spark UI (ui-v3) v2.4.0
> **For**: ronny-ops dashboard-api

---

## Summary

The Spark UI frontend is ready to wire these features, but needs API endpoints built in ronny-ops first.

**API Base**: `https://mintprints-api.ronny.works`
**Priority**: HIGH (blocks v2.5.0 release)

---

## Endpoint 1: Add Line Item (HIGH)

```
POST /api/orders/:id/line-items
```

### Request Body

```json
{
  "style_description": "Gildan 5000 - Heavy Cotton Tee",
  "style_number": "G500",
  "color": "Black",
  "unit_cost": 12.50,
  "total_quantity": 50,
  "sizes": {
    "size_xs": 0,
    "size_s": 10,
    "size_m": 20,
    "size_l": 15,
    "size_xl": 5,
    "size_2_xl": 0,
    "size_3_xl": 0
  },
  "taxable": true
}
```

### Response (Success)

```json
{
  "success": true,
  "lineItem": {
    "id": 12345,
    "style_description": "Gildan 5000 - Heavy Cotton Tee",
    "style_number": "G500",
    "color": "Black",
    "unit_cost": "12.50",
    "total_quantity": 50,
    "size_xs": 0,
    "size_s": 10,
    "size_m": 20,
    "size_l": 15,
    "size_xl": 5,
    "size_2_xl": 0,
    "size_3_xl": 0
  },
  "orderTotal": "1625.00"
}
```

### Database Tables

```sql
-- line_items table
INSERT INTO line_items (
  order_id, style_description, style_number, color,
  unit_cost, total_quantity, taxable,
  size_xs, size_s, size_m, size_l, size_xl, size_2_xl, size_3_xl
) VALUES (...)
```

### UI Handler Ready At

- **File**: `src/components/orders/OrderDetailPage.tsx`
- **Line**: ~1135 (`handleAddLineItem`)
- **Component**: `AddLineItemDialog` exists, needs wiring

---

## Endpoint 2: Delete Line Item (HIGH)

```
DELETE /api/orders/:id/line-items/:lineItemId
```

### Response (Success)

```json
{
  "success": true,
  "message": "Line item deleted",
  "orderTotal": "1312.50"
}
```

### Database

```sql
DELETE FROM line_items WHERE id = :lineItemId AND order_id = :orderId
-- Also delete linked imprints
DELETE FROM imprints_line_item_lnk WHERE line_item_id = :lineItemId
```

### UI Handler Ready At

- **File**: `src/components/orders/OrderDetailPage.tsx`
- **Handler**: Row dropdown menu "Delete" option
- **Line**: ~1738

---

## Endpoint 3: Add Imprint (HIGH)

```
POST /api/orders/:id/imprints
```

### Request Body

```json
{
  "line_item_id": 12345,
  "location": "Front Chest",
  "decoration_type": "Screen Printing",
  "description": "Logo - 1 color",
  "color_count": 1,
  "colors": "White",
  "width": 4.0,
  "height": 5.5
}
```

### Response (Success)

```json
{
  "success": true,
  "imprint": {
    "id": 789,
    "line_item_id": 12345,
    "location": "Front Chest",
    "decoration_type": "Screen Printing",
    "description": "Logo - 1 color",
    "color_count": 1,
    "colors": "White",
    "width": 4.0,
    "height": 5.5
  }
}
```

### Database Tables

```sql
-- imprints table
INSERT INTO imprints (
  printavo_id, description, placement_name, decoration_type,
  print_width, print_height, color_count, colors
) VALUES (...)

-- Link to line item
INSERT INTO imprints_line_item_lnk (imprint_id, line_item_id)
VALUES (:newImprintId, :lineItemId)
```

### Location Options (Dropdown Values)

```
Front Chest
Full Front
Full Back
Left Chest
Right Chest
Left Sleeve
Right Sleeve
Back Neck
```

### Decoration Type Options

```
Screen Printing
Embroidery
DTG (Direct to Garment)
Heat Transfer
Sublimation
```

### UI Handler Ready At

- **File**: `src/components/orders/OrderDetailPage.tsx`
- **Line**: ~1136 (`Add Imprint` button)
- **Note**: Button currently shows toast placeholder

---

## Endpoint 4: Update Imprint (HIGH)

```
PUT /api/orders/:id/imprints/:imprintId
```

### Request Body (Partial Update)

```json
{
  "location": "Full Back",
  "color_count": 2,
  "colors": "White + Navy"
}
```

### Response (Success)

```json
{
  "success": true,
  "imprint": {
    "id": 789,
    "line_item_id": 12345,
    "location": "Full Back",
    "decoration_type": "Screen Printing",
    "description": "Logo - 2 color",
    "color_count": 2,
    "colors": "White + Navy",
    "width": 4.0,
    "height": 5.5
  }
}
```

### UI Handler Ready At

- **File**: `src/components/orders/OrderDetailPage.tsx`
- **Line**: ~760 (`handleImprintCellBlur`)
- **Note**: Handler exists, shows toast only

---

## Endpoint 5: Delete Imprint (HIGH)

```
DELETE /api/orders/:id/imprints/:imprintId
```

### Response (Success)

```json
{
  "success": true,
  "message": "Imprint deleted"
}
```

### Database

```sql
-- Delete link first
DELETE FROM imprints_line_item_lnk WHERE imprint_id = :imprintId

-- Then delete imprint
DELETE FROM imprints WHERE id = :imprintId
```

### UI Handler Ready At

- **File**: `src/components/orders/OrderDetailPage.tsx`
- **Handler**: Will add delete button to imprint row

---

## Endpoint 6: Upload Artwork (MEDIUM)

```
POST /api/orders/:id/artwork
Content-Type: multipart/form-data
```

### Request Body

```
file: <binary>
line_item_id: 12345 (optional)
type: "mockup" | "production" (optional)
```

### Response (Success)

```json
{
  "success": true,
  "file": {
    "id": "uuid-here",
    "url": "https://files.ronny.works/artwork/uuid.png",
    "thumbnailUrl": "https://files.ronny.works/artwork/thumb_uuid.png",
    "filename": "original-name.png"
  }
}
```

### Backend Process

1. Receive file via multer middleware
2. Generate UUID filename
3. Create thumbnail with sharp (if image)
4. Upload both to MinIO `artwork` bucket
5. Create entry in `mockups` table
6. Return URLs

### MinIO Bucket

- **Bucket**: `artwork`
- **URL**: `https://files.ronny.works/artwork/`
- **Existing**: Yes, bucket exists

### UI Handler Ready At

- **File**: `src/components/orders/OrderDetailPage.tsx`
- **Line**: ~1546 (`handleMockupUpload`)
- **Component**: MockupUploadDialog exists

---

## Endpoint 7: Update Customer (MEDIUM)

```
PUT /api/customers/:id
```

### Request Body (Partial Update)

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@company.com",
  "phone": "555-1234",
  "company": "Acme Corp"
}
```

### Response (Success)

```json
{
  "success": true,
  "customer": {
    "id": 123,
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@company.com",
    "phone": "555-1234",
    "company": "Acme Corp"
  }
}
```

### UI Handler Ready At

- **File**: `src/components/customers/CustomerDetailPage.tsx`
- **Line**: ~164 (`handleSaveContact`)

---

## Existing Endpoints to Verify

These endpoints may already work - test before building:

```bash
# Line item update (may be working)
curl -X PUT "https://mintprints-api.ronny.works/api/orders/13689/line-items/123" \
  -H "Content-Type: application/json" \
  -d '{"unit_cost":15.50}'

# Status update (should be working - v2.2.2)
curl -X POST "https://mintprints-api.ronny.works/api/orders/13689/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETE"}'
```

---

## Test Order IDs

Use these orders for testing:

| Order ID | Notes |
|----------|-------|
| 13689 | Papa's Raw Bar - has mockups |
| 13648 | Has imprints |
| 6978 | Has 25 line items |

---

## Implementation Priority

1. **Line Item Add** (POST) - most requested feature
2. **Line Item Delete** (DELETE) - cleanup capability
3. **Imprint Add** (POST) - imprint management
4. **Imprint Update** (PUT) - inline editing
5. **Imprint Delete** (DELETE) - cleanup
6. **Artwork Upload** (POST) - file management
7. **Customer Update** (PUT) - contact editing

---

## Notes for Backend Dev

- All endpoints should return JSON with `success: true/false`
- Include updated totals when modifying line items
- Use transactions for delete operations (cleanup links)
- Validate order ownership before modifications
- Return 404 for missing orders/line items/imprints
- Return 400 for validation errors with `message` field
