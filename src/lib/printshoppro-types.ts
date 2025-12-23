// PrintShopPro types - ported exactly from print-shop-pro/src/lib/types.ts
// These types match the PrintShopPro LineItemGrid and DecorationManager components

export type ProductType = 'tshirt' | 'hoodie' | 'polo' | 'hat' | 'other'
export type DecorationType = 'screen-print' | 'dtg' | 'embroidery' | 'vinyl' | 'digital-print' | 'digital-transfer' | 'other'

export interface Sizes {
  XS: number
  S: number
  M: number
  L: number
  XL: number
  '2XL': number
  '3XL': number
}

export interface ArtworkFile {
  dataUrl: string
  fileName: string
  fileSize?: number
  width?: number
  height?: number
  approved?: boolean
  uploadedAt: string
}

export interface Decoration {
  id: string
  method: DecorationType
  customMethod?: string
  location: string
  customLocation?: string
  inkThreadColors: string
  imprintSize?: string
  artwork?: ArtworkFile
  mockup?: ArtworkFile
  setupFee: number
}

export interface PSPLineItem {
  id: string
  product_type: ProductType
  product_sku?: string
  product_name: string
  product_color?: string
  decoration: DecorationType
  print_locations: string[]
  decorations?: Decoration[]
  colors: number
  sizes: Sizes
  quantity: number
  genericQuantity?: number
  unit_price: number
  setup_fee: number
  line_total: number
  groupId?: string
}

export interface LineItemGroup {
  id: string
  name: string
  decorations: Decoration[]
  collapsed?: boolean
}

export interface CustomerDecorationTemplate {
  id: string
  customerId: string
  name: string
  description?: string
  decorations: Omit<Decoration, 'id'>[]
  createdAt: string
}

export type ArtworkCategory = 'neck-tag' | 'private-label' | 'logo' | 'graphic' | 'other'

export interface CustomerArtworkFile {
  id: string
  customerId: string
  name: string
  description?: string
  category: ArtworkCategory
  imprintSize?: string
  notes?: string
  file: {
    dataUrl: string
    fileName: string
    fileSize: number
  }
  uploadedAt: string
  updatedAt: string
  currentVersion: number
}

export type ImprintTemplateCategory = 'screen-print' | 'embroidery' | 'dtg' | 'vinyl' | 'specialty' | 'custom'

export interface ImprintTemplate {
  id: string
  name: string
  description?: string
  category: ImprintTemplateCategory
  customCategory?: string
  decoration: Omit<Decoration, 'id'>
  tags?: string[]
  previewImageUrl?: string
  isActive: boolean
  usageCount: number
  lastUsed?: string
  createdAt: string
  updatedAt: string
}

// Helper functions
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function calculateSizesTotal(sizes: Sizes): number {
  return (sizes.XS || 0) +
         (sizes.S || 0) +
         (sizes.M || 0) +
         (sizes.L || 0) +
         (sizes.XL || 0) +
         (sizes['2XL'] || 0) +
         (sizes['3XL'] || 0)
}

export function calculateLineItemTotal(item: PSPLineItem): number {
  const quantity = item.genericQuantity || item.quantity || calculateSizesTotal(item.sizes)
  const productTotal = quantity * item.unit_price
  const decorationsTotal = (item.decorations || []).reduce((sum, dec) => sum + dec.setupFee, 0)
  return productTotal + decorationsTotal + item.setup_fee
}

// Convert ui-v3 API data to PrintShopPro format
export function convertToLineItem(apiItem: {
  id: number
  styleNumber?: string
  description?: string
  color?: string
  sizes: Record<string, number>
  totalQuantity: number
  unitCost: number
  totalCost?: number
  imprints?: Array<{
    id: number
    location?: string
    decorationType?: string
    description?: string
    colorCount?: number
    colors?: string
  }>
}): PSPLineItem {
  return {
    id: String(apiItem.id),
    product_type: 'tshirt',
    product_sku: apiItem.styleNumber || '',
    product_name: apiItem.description || '',
    product_color: apiItem.color || '',
    decoration: 'screen-print',
    print_locations: [],
    decorations: (apiItem.imprints || []).map(imp => ({
      id: String(imp.id),
      method: mapDecorationType(imp.decorationType),
      location: imp.location || 'Front',
      inkThreadColors: imp.colors || '',
      setupFee: 0,
    })),
    colors: 0,
    sizes: {
      XS: apiItem.sizes.xs || 0,
      S: apiItem.sizes.s || 0,
      M: apiItem.sizes.m || 0,
      L: apiItem.sizes.l || 0,
      XL: apiItem.sizes.xl || 0,
      '2XL': apiItem.sizes.xxl || 0,
      '3XL': apiItem.sizes.xxxl || 0,
    },
    quantity: apiItem.totalQuantity || 0,
    unit_price: apiItem.unitCost || 0,
    setup_fee: 0,
    line_total: apiItem.totalCost || (apiItem.totalQuantity * apiItem.unitCost) || 0,
  }
}

function mapDecorationType(apiType?: string): DecorationType {
  if (!apiType) return 'screen-print'
  const lower = apiType.toLowerCase()
  if (lower.includes('screen')) return 'screen-print'
  if (lower.includes('embroid')) return 'embroidery'
  if (lower.includes('dtg')) return 'dtg'
  if (lower.includes('vinyl')) return 'vinyl'
  if (lower.includes('digital')) return 'digital-print'
  return 'other'
}
