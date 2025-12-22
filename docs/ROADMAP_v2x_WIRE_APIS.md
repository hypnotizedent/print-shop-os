# Mint OS v2.x Roadmap - Wire Existing APIs

> **Created**: December 22, 2025
> **Discovery**: 113 endpoints, 21 systems, ~15% UI coverage
> **Strategy**: Wire what's built before building new

---

## Quick Reference: What's Ready

| System | Endpoints | UI Today | Effort to Wire |
|--------|-----------|----------|----------------|
| Quote Builder v2 | 13 | ❌ None | 2-3 days |
| Reports API | 14 | ❌ None | 1 day |
| Shipping (EasyPost) | 6 | ❌ None | 1-2 days |
| Supplier Search | 12 | ❌ None | 1-2 days |
| Payments/Invoicing | 4 | ❌ None | 0.5 day |
| AI Chat | 6 | ❌ None | 1 day |
| Employee Portal | 12 | Separate app | - |
| Customer Portal | 7 | Separate app | - |
| Timekeeping | 9 | Separate app | - |

---

## Recommended Version Plan

### v2.2.0 - Quote System (Your "New Order" Flow)
**Effort**: 2-3 days
**Impact**: HIGH - Enables creating new business

Wire Quote Builder v2 to ui-v3:
- [ ] Add "Quotes" nav item
- [ ] Port QuotesList.tsx from PrintShopPro
- [ ] Port QuoteBuilder.tsx (or simplified version)
- [ ] Wire "New Order" button → /quotes/new
- [ ] Wire "Convert to Order" button
- [ ] Wire status changes

**API Endpoints (already exist)**:
```
GET    /api/v2/quotes
POST   /api/v2/quotes
GET    /api/v2/quotes/:id
PUT    /api/v2/quotes/:id
DELETE /api/v2/quotes/:id
PUT    /api/v2/quotes/:id/status
POST   /api/v2/quotes/:id/convert
POST   /api/v2/quotes/:id/line-items
PUT    /api/v2/quotes/:id/line-items/:id
DELETE /api/v2/quotes/:id/line-items/:id
```

---

### v2.3.0 - Reports Dashboard
**Effort**: 1 day
**Impact**: HIGH - Business insights

Wire Reports API to ui-v3:
- [ ] Create Reports page
- [ ] Revenue chart (daily/weekly/monthly)
- [ ] Production stats
- [ ] Customer analytics
- [ ] CSV export buttons

**API Endpoints (already exist)**:
```
GET /api/reports/revenue
GET /api/reports/revenue/by-period
GET /api/reports/production
GET /api/reports/customers
GET /api/reports/products
GET /api/reports/status-summary
GET /api/reports/export/csv
```

---

### v2.4.0 - Order Actions
**Effort**: 0.5 day
**Impact**: MEDIUM - Daily workflow

Add action buttons to Order Detail:
- [ ] "Record Payment" button → modal → POST /api/payments
- [ ] "Send Invoice" button → POST /api/orders/:id/send-invoice
- [ ] "View Profit" display → GET /api/orders/:id/profit
- [ ] "Duplicate Order" → POST /api/orders/:id/duplicate

**API Endpoints (already exist)**:
```
POST /api/payments
POST /api/orders/:id/send-invoice
GET  /api/orders/:id/profit
POST /api/orders/:id/duplicate (may need to verify)
```

---

### v2.5.0 - Shipping Labels
**Effort**: 1-2 days
**Impact**: MEDIUM - Streamlines fulfillment

Add shipping to Order Detail:
- [ ] "Get Shipping Rates" button → modal with options
- [ ] "Create Label" button → generates PDF
- [ ] "Track Package" link
- [ ] Display tracking status on order

**API Endpoints (already exist)**:
```
POST /api/shipping/rates
POST /api/shipping/labels
GET  /api/shipping/labels/:id
POST /api/shipping/track
GET  /api/shipping/tracking/:trackingNumber
```

---

### v2.6.0 - Supplier Product Search
**Effort**: 1-2 days
**Impact**: MEDIUM - Quote building efficiency

Add product catalog to Quote Builder:
- [ ] Search SanMar products
- [ ] Search S&S Activewear products
- [ ] View product details, pricing, inventory
- [ ] Add to quote with one click

**API Endpoints (already exist)**:
```
GET /api/suppliers/search
GET /api/suppliers/sanmar/products
GET /api/suppliers/sanmar/inventory
GET /api/suppliers/ss/products
GET /api/suppliers/ss/inventory
```

---

### v2.7.0 - AI Assistant
**Effort**: 1 day
**Impact**: LOW-MEDIUM - Nice to have

Add AI chat to ui-v3:
- [ ] Chat panel/modal
- [ ] Knowledge base queries
- [ ] Order assistance

**API Endpoints (already exist)**:
```
POST /api/ai/chat
POST /api/ai/complete
GET  /api/ai/models
POST /api/ai/knowledge/query
```

---

## What Still Needs Building (Not in API)

| Feature | Needed For | Priority |
|---------|------------|----------|
| POST /api/customers | Creating new customers | HIGH |
| PUT /api/customers/:id | Editing customers | HIGH |
| PUT /api/orders/:id | Editing orders | MEDIUM |
| Line Item CRUD on orders | Editing existing orders | MEDIUM |
| Public quote view page | Customer approval | MEDIUM |

---

## Effort Summary

| Version | Focus | Days | Cumulative |
|---------|-------|------|------------|
| v2.2.0 | Quotes | 2-3 | 2-3 days |
| v2.3.0 | Reports | 1 | 3-4 days |
| v2.4.0 | Order Actions | 0.5 | 4-5 days |
| v2.5.0 | Shipping | 1-2 | 5-7 days |
| v2.6.0 | Suppliers | 1-2 | 6-9 days |
| v2.7.0 | AI | 1 | 7-10 days |

**In ~10 days, you could have 85%+ of your API wired to UI.**

---

## Today's Remaining Work

### Finish v2.1.5 (Customers API)
The customers sorting/accuracy fixes are deploying.

### Decision: What's Next?

Option A: **Start v2.2.0 (Quotes)** - Gets you creating new business
Option B: **Start v2.3.0 (Reports)** - Quick win, 1 day
Option C: **Fix Order Detail first** - Make existing orders fully functional

**Recommendation**: v2.2.0 (Quotes) - It's your core workflow and Quote Builder is mostly built.

---

## Files Created Today

### Documentation
- DIAG_ORDER_CARD_FIELDS.md
- DIAG_ORDER_CARD_UI.md
- DIAG_CUSTOMERS_API.md
- DIAG_CUSTOMERS_PAGE.md
- DIAG_CUSTOMER_CARD_v214.md
- DIAG_CUSTOMERS_DATA_ACCURACY.md
- DIAG_PRINTSHOPPRO_COMPARISON.md
- DIAG_ORDER_DETAIL_API.md
- DIAG_ORDER_DETAIL_PAGE.md
- DISCOVERY_QUOTE_BUILDER_V2.md
- DISCOVERY_QUOTE_BUILDER_UI.md
- DISCOVERY_ALL_API_CAPABILITIES.md
- PLAN_ORDER_DETAIL_v220.md
- PORT_QUOTE_BUILDER.md

### This Roadmap
- ROADMAP_v2x_WIRE_APIS.md
