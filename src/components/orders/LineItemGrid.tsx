// LineItemGrid - Ported from PrintShopPro exactly
// Source: ~/spark/print-shop-pro/src/components/LineItemGrid.tsx

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DecorationManager } from './DecorationManager'
import {
  Trash,
  CaretDown,
  CaretRight,
  Copy,
  DotsSixVertical,
} from '@phosphor-icons/react'
import type { PSPLineItem, Sizes, Decoration } from '@/lib/printshoppro-types'
import { calculateSizesTotal, calculateLineItemTotal, generateId } from '@/lib/printshoppro-types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface LineItemGridProps {
  items: PSPLineItem[]
  onChange: (items: PSPLineItem[]) => void
  customerId?: string
  customerName?: string
  onAddImprint?: (itemId: string) => void
}

export function LineItemGrid({
  items,
  onChange,
  customerId,
  customerName,
  onAddImprint,
}: LineItemGridProps) {
  const [expandedLocations, setExpandedLocations] = React.useState<Set<string>>(new Set())
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const updateItem = (index: number, updates: Partial<PSPLineItem>) => {
    const newItems = [...items]
    const item = { ...newItems[index], ...updates }

    if (updates.sizes) {
      item.quantity = calculateSizesTotal(updates.sizes)
    }

    item.line_total = calculateLineItemTotal(item)

    newItems[index] = item
    onChange(newItems)
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const duplicateItem = (index: number) => {
    const itemToDuplicate = items[index]
    const duplicatedItem: PSPLineItem = {
      ...itemToDuplicate,
      id: generateId('li'),
      decorations: itemToDuplicate.decorations?.map(dec => ({
        ...dec,
        id: generateId('dec'),
      }))
    }
    const newItems = [...items]
    newItems.splice(index + 1, 0, duplicatedItem)
    onChange(newItems)
    toast.success('Line item duplicated')
  }

  const toggleLocationsSection = (itemId: string) => {
    setExpandedLocations(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const handleDecorationsChange = (index: number, decorations: Decoration[]) => {
    updateItem(index, { decorations })
  }

  const handleSizeChange = (index: number, size: keyof Sizes, value: number) => {
    const item = items[index]
    const newSizes = { ...item.sizes, [size]: value }
    updateItem(index, { sizes: newSizes })
  }

  const getTotalDecorations = (item: PSPLineItem): number => {
    return (item.decorations || []).length
  }

  const getTotalSetupFees = (item: PSPLineItem): number => {
    return (item.decorations || []).reduce((sum, dec) => sum + dec.setupFee, 0)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newItems = [...items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)

    onChange(newItems)
    toast.success('Line item reordered')

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const duplicateImprint = (itemIndex: number, decorationIndex: number) => {
    const item = items[itemIndex]
    if (!item.decorations) return

    const decorationToDuplicate = item.decorations[decorationIndex]
    const duplicatedDecoration: Decoration = {
      ...decorationToDuplicate,
      id: generateId('dec'),
    }

    const newDecorations = [...item.decorations]
    newDecorations.splice(decorationIndex + 1, 0, duplicatedDecoration)

    updateItem(itemIndex, { decorations: newDecorations })
    toast.success('Imprint duplicated')
  }

  const renderLineItem = (item: PSPLineItem, index: number) => {
    return (
      <React.Fragment key={item.id}>
        <tr
          className={`border-b border-border transition-colors ${
            draggedIndex === index
              ? 'opacity-40'
              : dragOverIndex === index
              ? 'bg-primary/10'
              : 'hover:bg-muted/20'
          }`}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          {/* Drag Handle */}
          <td className="px-2 py-2.5">
            <div
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              title="Drag to reorder"
            >
              <DotsSixVertical size={16} weight="bold" />
            </div>
          </td>

          {/* SKU */}
          <td className="px-3 py-2.5">
            <Input
              value={item.product_sku || ''}
              onChange={(e) => updateItem(index, { product_sku: e.target.value })}
              placeholder="SKU"
              className="h-8 border-0 bg-transparent hover:bg-background focus:bg-background px-2"
            />
          </td>

          {/* Product Name */}
          <td className="px-3 py-2.5">
            <Input
              value={item.product_name}
              onChange={(e) => updateItem(index, { product_name: e.target.value })}
              placeholder="e.g., Gildan 5000"
              className="h-8 border-0 bg-transparent hover:bg-background focus:bg-background px-2"
            />
          </td>

          {/* Color */}
          <td className="px-3 py-2.5">
            <Input
              value={item.product_color || ''}
              onChange={(e) => updateItem(index, { product_color: e.target.value })}
              placeholder="e.g., Navy"
              className="h-8 border-0 bg-transparent hover:bg-background focus:bg-background px-2"
            />
          </td>

          {/* Sizes */}
          <td className="px-3 py-2.5">
            <div className="flex gap-1.5 items-center">
              {(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const).map((size) => (
                <div key={size} className="flex flex-col items-center flex-1 min-w-0">
                  <label className="text-[10px] text-muted-foreground mb-0.5 font-medium">
                    {size}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={item.sizes[size]}
                    onChange={(e) => handleSizeChange(index, size, Number(e.target.value))}
                    className="h-7 w-full text-center text-xs tabular-nums border-0 bg-transparent hover:bg-background focus:bg-background px-1"
                  />
                </div>
              ))}
              <div className="flex flex-col items-center flex-1 min-w-0 ml-2">
                <label className="text-[10px] text-muted-foreground mb-0.5 font-medium">
                  Qty
                </label>
                <Input
                  type="number"
                  min="0"
                  value={item.genericQuantity || ''}
                  onChange={(e) => updateItem(index, {
                    genericQuantity: e.target.value ? Number(e.target.value) : undefined,
                    quantity: e.target.value ? Number(e.target.value) : calculateSizesTotal(item.sizes)
                  })}
                  placeholder="0"
                  className="h-7 w-full text-center text-xs tabular-nums border-0 bg-transparent hover:bg-background focus:bg-background px-1"
                  title="Generic quantity field for orders without size breakdown"
                />
              </div>
            </div>
          </td>

          {/* Price */}
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={item.unit_price}
                onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                className="h-8 w-20 text-right tabular-nums border-0 bg-transparent hover:bg-background focus:bg-background px-2"
              />
            </div>
          </td>

          {/* Actions */}
          <td className="px-2 py-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                >
                  <Copy size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => duplicateItem(index)}>
                  <Copy size={14} className="mr-2" />
                  Duplicate Line Item
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => removeItem(index)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>

        {/* Decorations Row */}
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={7} className="px-3 py-0">
            <div className="py-2">
              <button
                onClick={() => toggleLocationsSection(item.id)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {expandedLocations.has(item.id) ? (
                  <CaretDown size={14} weight="bold" />
                ) : (
                  <CaretRight size={14} weight="bold" />
                )}
                <span className="font-medium">
                  Locations & Decoration
                </span>
                <span className="text-xs">
                  ({getTotalDecorations(item)} imprint{getTotalDecorations(item) !== 1 ? 's' : ''})
                </span>
                {getTotalSetupFees(item) > 0 && (
                  <span className="text-xs text-muted-foreground">
                    • Setup: ${getTotalSetupFees(item).toFixed(2)}
                  </span>
                )}
                <div className="ml-auto text-xs font-bold text-primary tabular-nums">
                  Total: ${item.line_total.toFixed(2)} ({item.quantity} pcs)
                </div>
              </button>

              {expandedLocations.has(item.id) && (
                <div className="mt-3 pb-3">
                  <DecorationManager
                    decorations={item.decorations || []}
                    onChange={(decorations) => handleDecorationsChange(index, decorations)}
                    productType={item.product_type}
                    customerId={customerId}
                    customerName={customerName}
                    lineItems={items}
                    currentItemIndex={index}
                    onDuplicateImprint={(decorationIndex) => duplicateImprint(index, decorationIndex)}
                  />
                </div>
              )}
            </div>
          </td>
        </tr>
      </React.Fragment>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="w-8"></th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[12%]">
              PRODUCT SKU
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[20%]">
              PRODUCT STYLE
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[10%]">
              COLOR
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[35%]">
              SIZES
            </th>
            <th className="text-right text-xs font-semibold text-muted-foreground px-3 py-2 w-[10%]">
              PRICE
            </th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => renderLineItem(item, index))}
        </tbody>
      </table>

      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No line items yet. Click "Add Line Item" to get started.
        </div>
      )}
    </div>
  )
}
