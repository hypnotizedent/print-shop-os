# Feature Tracker - Mint OS ui-v3

> **Last Updated**: December 22, 2025
> **Current Version**: v2.7.0

---

## Done

### December 22, 2025 - Marathon Session

| Version | Features | Status |
|---------|----------|--------|
| v2.7.0 | Cmd+K shortcut, customer edit modal, address display | Done |
| v2.6.0 | Artwork upload with drag-drop (MinIO) | Done |
| v2.5.0 | Imprint CRUD (add/edit/delete wired to API) | Done |
| v2.4.0 | Unified global search with typeahead dropdown | Done |
| v2.3.0 | Dynamic size columns (baby/youth/adult) | Done |
| v2.2.5 | Remove mock data, empty states, size collapse | Done |
| v2.2.4 | Pagination, global search, mockup modal | Done |
| v2.2.3 | Reports page with production stats | Done |
| v2.2.2 | Status dropdown, payment summary | Done |
| v2.2.1 | Quote detail view fixes | Done |
| v2.2.0 | Quotes nav, unified detail page, quote-to-order | Done |
| v2.1.x | Initial API wiring, orders list, customers list | Done |

---

## Next Up

### v2.8.0 - Quote Builder Enhancement

| Feature | Priority | Status |
|---------|----------|--------|
| Full quote builder workflow | HIGH | Planned |
| Item catalog integration | MEDIUM | Planned |
| Pricing calculator | MEDIUM | Planned |

### v2.9.0 - Production Board

| Feature | Priority | Status |
|---------|----------|--------|
| Kanban-style production view | HIGH | Planned |
| Drag-drop status changes | MEDIUM | Planned |
| Team assignment | LOW | Planned |

### v3.0.0 - Launch Ready

| Feature | Priority | Status |
|---------|----------|--------|
| Full QA pass | HIGH | Planned |
| Performance optimization | HIGH | Planned |
| Mobile responsiveness audit | MEDIUM | Planned |

---

## Backlog

| Feature | Notes |
|---------|-------|
| Bulk status updates | Multi-select orders |
| Print invoice/packing slip | PDF generation |
| Email templates | Customer notifications |
| Customer portal | Self-service order tracking |
| Supplier integrations | SanMar, S&S, etc. |
| Line Item Add/Delete | Pending API endpoints |

---

## API Endpoints Status

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `PATCH /api/orders/:id/status` | Change order status | Working |
| `PUT /api/orders/:id/line-items/:id` | Update line item | Working |
| `POST /api/orders/:id/imprints` | Add imprint | Working |
| `PUT /api/orders/:id/imprints/:id` | Update imprint | Working |
| `DELETE /api/orders/:id/imprints/:id` | Delete imprint | Working |
| `POST /api/orders/:id/artwork` | Upload artwork | Working |
| `DELETE /api/orders/:id/artwork/:id` | Delete artwork | Working |
| `PUT /api/customers/:id` | Update customer | Working |
| `POST /api/orders/:id/line-items` | Add line item | Pending |
| `DELETE /api/orders/:id/line-items/:id` | Delete line item | Pending |

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| `SESSION_DEC22_SPARK.md` | Session summary |
| `HANDOFF_RONNY_OPS_API.md` | API endpoint specs |
| `AUDIT_SEARCH_SYSTEMS.md` | Global search audit |
| `PLAN_DYNAMIC_SIZE_COLUMNS.md` | Size columns plan |
| `AUDIT_ORDER_DETAIL_PAGE.md` | Order detail audit |
