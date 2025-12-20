# Visual Comparison: Before & After

## Before Implementation

```
┌─────────────────────────────────────┐
│  Line Item #1                       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  Gildan T-Shirt       │
│  │         │  Style: 64000          │
│  │   📄    │  Color: Navy           │
│  │  PDF    │  Qty: 50               │
│  │         │  $450.00               │
│  └─────────┘                        │
│                                     │
│  Imprint:                           │
│  ┌────┐  Front • Screen Print      │
│  │ 📄 │  [Open PDF]                 │
│  └────┘                             │
└─────────────────────────────────────┘

Static PDF icon - no preview available
User must click to see content
```

## After Implementation (With Thumbnail)

```
┌─────────────────────────────────────┐
│  Line Item #1                       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  Gildan T-Shirt       │
│  │ ╔═══╗   │  Style: 64000          │
│  │ ║IMG║   │  Color: Navy           │
│  │ ╚═══╝   │  Qty: 50               │
│  │ Preview │  $450.00               │
│  └─────────┘                        │
│                                     │
│  Imprint:                           │
│  ┌────┐  Front • Screen Print      │
│  │IMG │  [Open PDF]                 │
│  └────┘                             │
└─────────────────────────────────────┘

Actual thumbnail preview displayed
User can see content at a glance
Click to view full PDF
```

## After Implementation (Fallback When Thumbnail Unavailable)

```
┌─────────────────────────────────────┐
│  Line Item #1                       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  Gildan T-Shirt       │
│  │         │  Style: 64000          │
│  │   📄    │  Color: Navy           │
│  │  PDF    │  Qty: 50               │
│  │         │  $450.00               │
│  └─────────┘                        │
│                                     │
│  Imprint:                           │
│  ┌────┐  Front • Screen Print      │
│  │ 📄 │  [Open PDF]                 │
│  └────┘                             │
└─────────────────────────────────────┘

Graceful fallback to PDF icon
No broken images or layout issues
Same user experience as before
```

## Component Architecture

```
OrderDetailPage
│
├─ LineItemCard (for each line item)
│  │
│  ├─ Mockup Display
│  │  └─ PdfThumbnail Component
│  │     ├─ If thumbnail_url exists → Show <img>
│  │     ├─ If thumbnail loads → Display preview
│  │     ├─ If thumbnail fails → Show PDF icon
│  │     └─ If no thumbnail_url → Show PDF icon
│  │
│  └─ Imprint Section
│     └─ PdfThumbnail Component
│        └─ Same logic as above (smaller size)
│
└─ Production Files Section
   └─ Similar rendering (not modified in this PR)
```

## State Management Flow

```
PdfThumbnail Component
│
├─ Props:
│  ├─ thumbnailUrl: string | null | undefined
│  ├─ pdfUrl: string
│  ├─ name: string
│  └─ size: 'small' | 'large'
│
├─ State:
│  └─ thumbnailFailed: boolean (default: false)
│
├─ Effects:
│  └─ useEffect(() => {
│       setThumbnailFailed(false)
│     }, [thumbnailUrl])
│
└─ Render Logic:
   ├─ If !thumbnailUrl → Show PDF icon
   ├─ If thumbnailFailed → Show PDF icon
   └─ Else → Show <img> with onError handler
```

## Data Flow Example

```
API Response
├─ {
│    "lineItems": [{
│      "mockup": {
│        "url": "https://files.ronny.works/artwork/ABC123.pdf",
│        "thumbnail_url": "https://files.ronny.works/artwork/ABC123_thumb.png"
│      }
│    }]
│  }
│
↓ API Adapter (hooks.ts)
│
OrderDetail Type
├─ {
│    lineItems: [{
│      mockup: {
│        url: string,
│        thumbnail_url: string | null  ← Extracted
│      }
│    }]
│  }
│
↓ UI Component
│
PdfThumbnail Component
└─ Renders thumbnail or falls back to icon
```

## Responsive Behavior

### Large Thumbnails (Line Items)
```
┌──────────────────────┐
│                      │
│    20x20 (80px)      │
│                      │
│   Thumbnail Image    │
│                      │
│                      │
└──────────────────────┘

or

┌──────────────────────┐
│                      │
│                      │
│       📄 PDF         │
│       Icon           │
│                      │
└──────────────────────┘
```

### Small Thumbnails (Imprints)
```
┌─────────────┐
│             │
│ 12x12 (48px)│
│             │
└─────────────┘
```

## Error Scenarios Handled

1. **No thumbnail_url in API response**
   ```
   mockup: {
     url: "file.pdf",
     thumbnail_url: null  ← UI shows PDF icon
   }
   ```

2. **Thumbnail URL returns 404**
   ```
   <img src="missing.png" onError={...} />
   ↓
   State: thumbnailFailed = true
   ↓
   UI shows PDF icon
   ```

3. **Network error loading thumbnail**
   ```
   <img src="file.png" onError={...} />
   ↓
   State: thumbnailFailed = true
   ↓
   UI shows PDF icon
   ```

4. **Thumbnail URL changes**
   ```
   useEffect resets thumbnailFailed state
   ↓
   Tries to load new thumbnail
   ↓
   Shows thumbnail or icon based on result
   ```

## Browser Compatibility

✅ All modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

Uses standard HTML/CSS/React patterns:
- `<img>` tag
- `onError` event handler
- CSS classes for styling
- React hooks (useState, useEffect)
