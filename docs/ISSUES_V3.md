# Mint OS UI v3.0 Issues Tracker

**Last Updated:** 2025-12-23
**Live URL:** https://mintprints.hypnotized.link (or configured domain)

---

## Deployment Status

| Step | Status | Notes |
|------|--------|-------|
| Changes committed | DONE | Commit aa62f68 |
| Pushed to GitHub | DONE | main branch |
| Spark auto-sync | PENDING | Check Spark dashboard |
| Published in Spark | PENDING | Click "Publish" button |
| Live site verification | PENDING | Hard refresh (Cmd+Shift+R) |

---

## Issues Checklist

### 1. Sidebar Logo - Sparkle Icon
- **Status:** DEPLOYED - NEEDS VERIFICATION
- **File:** `src/App.tsx` line 277
- **Expected:** Green sparkle icon from Phosphor Icons (matching PrintShopPro)
- **Verification:** Check sidebar shows filled sparkle icon, not diamond shape
- [ ] Verified on live site

### 2. Favicon - Sparkle SVG
- **Status:** DEPLOYED - NEEDS VERIFICATION
- **File:** `index.html` line 8
- **Expected:** Emerald green sparkle favicon in browser tab
- **Verification:** Check browser tab shows green sparkle icon
- [ ] Verified on live site

### 3. Page Title
- **Status:** DEPLOYED - NEEDS VERIFICATION
- **File:** `index.html` line 7
- **Expected:** "Mint Prints" in browser tab
- [ ] Verified on live site

### 4. Customers List - Card Grid Layout
- **Status:** DEPLOYED - NEEDS VERIFICATION
- **File:** `src/components/customers/CustomersListPage.tsx`
- **Expected:**
  - Desktop (xl): 3 columns
  - Tablet (md): 2 columns
  - Mobile: 1 column
  - Cards show: Name, Company, Tier badge, Revenue, Orders count, Last order date
- [ ] Verified on live site - Desktop 3 columns
- [ ] Verified on live site - Tablet 2 columns

### 5. Customer Detail - Address Display
- **Status:** DEPLOYED - NEEDS VERIFICATION
- **File:** `src/lib/hooks.ts` (useCustomerDetail), `src/components/customers/CustomerDetailPage.tsx`
- **Expected:** Customer address displays correctly (street, city, state, zip)
- **Test:** Customer #24634 should show address
- [ ] Verified on live site

### 6. Order Detail - Compact Header
- **Status:** DEPLOYED - NEEDS VERIFICATION
- **File:** `src/components/orders/OrderDetailPage.tsx`
- **Expected:**
  - Compact 2-line header with order#, nickname, status, total, balance
  - Customer info in second line (name, company, email)
  - No redundant customer info card
- **Test:** Order #6978 or #13689
- [ ] Verified on live site

### 7. Global Search Styling
- **Status:** DEPLOYED - NEEDS VERIFICATION
- **File:** `src/components/search/GlobalSearch.tsx`
- **Expected:**
  - Search dropdown properly styled
  - Results show correctly
  - Requires 2+ chars for contains matches
- [ ] Verified on live site

---

## Verification Commands

```bash
# Check current deployed commit
curl -s https://mintprints.hypnotized.link | grep -o 'v[0-9.]*'

# Test API connectivity
curl -s "https://mintprints-api.ronny.works/api/health" | jq
```

---

## Known Issues Not Yet Fixed

| Issue | Severity | Status |
|-------|----------|--------|
| Status dropdown saves don't persist | HIGH | Needs API endpoint |
| Line item edits don't persist | HIGH | Needs API endpoint |
| Customer edits don't persist | MEDIUM | Needs API endpoint |

---

## How to Verify

1. **Hard refresh** the live site: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. **Clear cache** if needed: DevTools > Application > Clear site data
3. **Check console** for errors: DevTools > Console
4. **Test each feature** listed above
5. **Mark checkbox** when verified working

---

## Rollback Plan

If critical issues found:
```bash
git revert aa62f68
git push origin main
# Then click Publish in Spark
```
