# Spark UI (ui-v3) - Claude Code Context

## 🎯 MISSION
Wire this Spark UI to the live Mint OS API so the dashboard displays real production data from Mint Prints.

---

## 🎯 HIGH PRIORITY - v2.2.0 Quote System (December 2025)

### Goal: Create new quotes/orders in Mint OS (replace Printavo)

**Phase 1 - Core Quote Builder (Day 1-2)**
- [ ] Add "Quotes" to sidebar navigation
- [ ] Create /quotes route → QuotesList page
- [ ] Create /quotes/new route → QuoteBuilder page
- [ ] Wire "New Order" button → navigate to /quotes/new
- [ ] Port QuoteBuilder.tsx from PrintShopPro (633 lines)
- [ ] Port CustomerSearch.tsx (172 lines)
- [ ] Wire to real API: GET/POST /api/v2/quotes

**Phase 2 - Line Items (Day 2)**
- [ ] Port LineItemGrid.tsx (1,161 lines) or create simplified version
- [ ] Wire to: POST/PUT/DELETE /api/v2/quotes/:id/line-items
- [ ] Port PricingSummary.tsx (115 lines)
- [ ] Auto-calculate totals on changes

**Phase 3 - Convert to Order (Day 2-3)**
- [ ] Add "Convert to Order" button
- [ ] Wire to: POST /api/v2/quotes/:id/convert
- [ ] Navigate to new order after conversion
- [ ] Success notification

**API Endpoints (To Build)**
```
GET    /api/v2/quotes
POST   /api/v2/quotes
GET    /api/v2/quotes/:id
PUT    /api/v2/quotes/:id
POST   /api/v2/quotes/:id/line-items
POST   /api/v2/quotes/:id/convert
```

**Reference Docs**
- docs/ROADMAP_v2x_WIRE_APIS.md - Version plan
- docs/PORT_QUOTE_BUILDER.md - Porting checklist
- docs/DISCOVERY_QUOTE_BUILDER_UI.md - PrintShopPro analysis

### Blocked Until API Ready
- [ ] Customer create (POST /api/customers) - ronny-ops building
- [ ] Customer edit (PUT /api/customers/:id) - ronny-ops building

### After v2.2.0: Quick Wins
| Feature | Effort | Impact |
|---------|--------|--------|
| Reports Dashboard | 1 day | Business insights |
| Record Payment button | 2 hours | Daily workflow |
| Shipping labels | 1-2 days | Fulfillment |

---

## 📚 Documentation Index

| Doc | Purpose |
|-----|---------|
| docs/ROADMAP_v2x_WIRE_APIS.md | Version roadmap |
| docs/PORT_QUOTE_BUILDER.md | Quote Builder porting plan |
| docs/DISCOVERY_QUOTE_BUILDER_UI.md | PrintShopPro analysis |
| docs/PLAN_ORDER_DETAIL_v220.md | Order detail improvements |
| docs/DIAG_ORDER_DETAIL_PAGE.md | Order detail audit |
| docs/DIAG_PRINTSHOPPRO_COMPARISON.md | UI comparison |
| docs/DIAG_CUSTOMER_CARD_v214.md | Customer card audit |

---

## 📊 BACKEND STATUS (COMPLETE - DO NOT MODIFY)

| Entity | Count | Status |
|--------|-------|--------|
| Orders | 12,905 | ✅ Live |
| Customers | 3,325 | ✅ Live |
| Line Items | 43,076 | ✅ Live |
| Imprints | 7,965 | ✅ Live |
| Mockups | 31,920 | ✅ Live |

**API Base URL**: `https://mintprints-api.ronny.works`
**Files URL**: `https://files.ronny.works`

---

## 🔌 LIVE API ENDPOINTS

### Test Commands
```bash
# Health check
curl -s "https://mintprints-api.ronny.works/api/health" | jq

# Orders list
curl -s "https://mintprints-api.ronny.works/api/orders?limit=5" | jq

# Order detail (with line items, imprints, mockups)
curl -s "https://mintprints-api.ronny.works/api/orders/13689" | jq

# Customers
curl -s "https://mintprints-api.ronny.works/api/customers?limit=5" | jq
```

### Test Order IDs with Complete Data
- **13689** - Papa's Raw Bar (has mockups)
- **13648** - Has imprints
- **6978** - Verified working

---

## 📋 API CONTRACT (EXACT FIELD NAMES)

### Orders List Response
```typescript
interface OrdersListResponse {
  orders: OrderSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface OrderSummary {
  id: number;
  visual_id: string;           // Display ID like "13689"
  order_nickname: string;      // Job name
  customer_name: string;       // Contact name (first + last), falls back to company
  customer_company: string;    // Company/business name
  customer_id: number;
  printavo_status_name: string; // Status text
  total_amount: string;        // e.g. "1303.66"
  due_date: string | null;
  created_at: string;
}
```

**Order Card Display:**
```
Line 1: customer_name     → "Jonathan Lieberman"
Line 2: customer_company  → "PTP Universal" (if different from name)
```

### Order Detail Response
```typescript
interface OrderDetailResponse {
  id: number;
  visual_id: string;
  order_nickname: string;
  printavo_status_name: string;
  total: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;

  customer: {
    id: number;
    company: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };

  lineItems: LineItem[];
  mockups: Mockup[];
}

interface LineItem {
  id: number;
  style_description: string;
  style_number: string;
  color: string;
  total_quantity: number;
  unit_cost: string;
  size_xs: number;
  size_s: number;
  size_m: number;
  size_l: number;
  size_xl: number;
  size_2_xl: number;
  size_3_xl: number;
  imprints: Imprint[];
}

interface Imprint {
  id: number;
  description: string;
  location: string;
  decoration_type: string;  // "Screen Print", "Embroidery", "DTG"
}

interface Mockup {
  id: number;
  full_url: string;         // https://files.ronny.works/artwork/...
  thumbnail_url: string;
  order_visual_id: string;
}
```

---

## 🔧 FIELD MAPPING (API → Frontend)

| API Returns | Frontend Should Use | Notes |
|-------------|---------------------|-------|
| `visual_id` | `visualId` | camelCase in JS |
| `order_nickname` | `nickname` or `orderNickname` | Job name |
| `printavo_status_name` | `status` | Status badge text |
| `customer_name` | `customerName` | Contact name (person) |
| `customer_company` | `customerCompany` | Business name |
| `total_amount` | `total` | Order total |
| `total_quantity` | `totalQuantity` | Per line item |
| `decorationType` | `decorationType` | For imprint badges (already camelCase) |

---

## 🎨 STATUS BADGE COLORS

```typescript
const statusColors: Record<string, string> = {
  'QUOTE': 'gray',
  'Quote Approved': 'blue',
  'COMPLETE': 'green',
  'Cancelled': 'red',
  // Screen Print statuses
  'SP - PRODUCTION': 'emerald',
  'SP - Preproduction': 'lime',
  // Embroidery statuses
  'EMB - PRODUCTION': 'blue',
  'EMB - Preproduction': 'sky',
  // Default
  'default': 'purple'
};
```

---

## 🖼️ MOCKUP HANDLING

### URL Format
All mockups served from MinIO:
```
https://files.ronny.works/artwork/{filename}
```

### PDF Detection
PDFs cannot be displayed as `<img>`. Must detect and handle:
```typescript
const isPDF = (url: string) => url?.toLowerCase().endsWith('.pdf');

// In render:
{isPDF(mockup.full_url) ? (
  <a href={mockup.full_url} target="_blank" className="pdf-link">
    📄 View PDF
  </a>
) : (
  <img src={mockup.full_url} alt="Mockup" />
)}
```

---

## 📝 TASKS

### 1. Audit Current State
```bash
cat src/lib/api-adapter.ts
cat src/pages/Dashboard.tsx
cat src/pages/OrderDetailPage.tsx
```

### 2. Fix API Adapter
Update `src/lib/api-adapter.ts` to:
- Point to `https://mintprints-api.ronny.works`
- Map snake_case API fields to camelCase
- Handle nested lineItems, imprints, mockups

### 3. Wire Orders List
- Fetch from `/api/orders`
- Display visual_id, order_nickname, customer_name, status
- Show line_item_count

### 4. Wire Order Detail
- Fetch from `/api/orders/:id`
- Display customer info
- Render line items with sizes
- Show imprints with decoration_type badges
- Display mockups (handle PDFs)

### 5. Remove Mock Data
- Delete or ignore any dev/mock data files
- Ensure all data comes from live API

---

## 🚀 DEPLOYMENT

1. Commit & push:
```bash
git add .
git commit -m "feat: wire real API data"
git push origin main
```

2. Spark auto-syncs from GitHub
3. Click "Publish" in Spark UI
4. Hard refresh browser (Cmd+Shift+R)

---

## ⚠️ IMPORTANT RULES

### API Issues:
- If API returns wrong/missing data → **fix the API** in `ronny-ops/02_Applications/mint-os/dashboard-api/`
- Frontend adapters only transform shape (camelCase), never compensate for missing API data
- See `docs/REF_FRONTEND_API_CONTRACT.md` for full API contract

### DO NOT:
- Use mock/dev data in production
- Add workarounds for API bugs in frontend
- Re-run Printavo sync (data is complete)

### DO:
- Use real API endpoints
- Handle API errors gracefully
- Test with order IDs: 13689, 13648, 6978
- Check browser console for errors
- Verify mockup images load from files.ronny.works

---

## ✅ SUCCESS CRITERIA

- [ ] Orders list loads from real API (should show ~12,905 total)
- [ ] Order detail shows all line items with quantities
- [ ] Mockups display correctly (no broken images)
- [ ] PDF mockups show link instead of broken image
- [ ] Imprints display with decoration type badges
- [ ] Customer info displays correctly
- [ ] No console errors
- [ ] No references to mock/dev data

---

## 📁 KEY FILES

```
src/
├── lib/
│   └── api-adapter.ts    # API calls & transformers (MAIN FILE TO EDIT)
├── pages/
│   ├── Dashboard.tsx     # Orders list
│   └── OrderDetailPage.tsx # Single order view
├── components/           # UI components
└── data/
    └── index.ts          # Mock data (REMOVE dependency on this)
```
