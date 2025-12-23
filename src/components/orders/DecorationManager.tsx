// DecorationManager - Ported from PrintShopPro exactly
// Source: ~/spark/print-shop-pro/src/components/DecorationManager.tsx

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Trash,
  Upload,
  CheckCircle,
  CaretDown,
  CaretRight,
  Copy,
  DotsSixVertical,
  Sparkle,
} from '@phosphor-icons/react'
import type { Decoration, DecorationType, ProductType, CustomerDecorationTemplate, CustomerArtworkFile, ImprintTemplate, PSPLineItem } from '@/lib/printshoppro-types'
import { generateId } from '@/lib/printshoppro-types'
import { toast } from 'sonner'

interface DecorationManagerProps {
  decorations: Decoration[]
  onChange: (decorations: Decoration[]) => void
  productType?: ProductType
  customerId?: string
  customerName?: string
  customerTemplates?: CustomerDecorationTemplate[]
  customerArtworkFiles?: CustomerArtworkFile[]
  imprintTemplates?: ImprintTemplate[]
  onSaveTemplate?: (template: CustomerDecorationTemplate) => void
  onUpdateImprintTemplate?: (template: ImprintTemplate) => void
  lineItems?: PSPLineItem[]
  currentItemIndex?: number
  onDuplicateImprint?: (decorationIndex: number) => void
  onMoveImprintToItem?: (decorationIndex: number, toItemIndex: number) => void
  onCopyImprintToItem?: (decorationIndex: number, toItemIndex: number) => void
}

const DEFAULT_LOCATIONS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Hood']
const DECORATION_METHODS: { value: DecorationType; label: string }[] = [
  { value: 'screen-print', label: 'Screen Printing' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'digital-print', label: 'Digital Print' },
  { value: 'digital-transfer', label: 'Digital Transfer' },
  { value: 'dtg', label: 'DTG' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'other', label: 'Other' },
]

const DECORATION_PRESETS: { name: string; description: string; decorations: Omit<Decoration, 'id'>[] }[] = [
  {
    name: 'Front Logo Only',
    description: 'Single front chest logo',
    decorations: [{
      method: 'screen-print',
      location: 'Front',
      inkThreadColors: '',
      setupFee: 0,
    }]
  },
  {
    name: 'Front + Back',
    description: 'Front chest and full back design',
    decorations: [
      { method: 'screen-print', location: 'Front', inkThreadColors: '', setupFee: 0 },
      { method: 'screen-print', location: 'Back', inkThreadColors: '', setupFee: 0 }
    ]
  },
  {
    name: 'Front + Back + Left Sleeve',
    description: 'Front, back, and sleeve branding',
    decorations: [
      { method: 'screen-print', location: 'Front', inkThreadColors: '', setupFee: 0 },
      { method: 'screen-print', location: 'Back', inkThreadColors: '', setupFee: 0 },
      { method: 'screen-print', location: 'Left Sleeve', inkThreadColors: '', setupFee: 0 }
    ]
  },
]

export function DecorationManager({
  decorations,
  onChange,
  productType,
  customerId,
  customerName,
  customerTemplates = [],
  customerArtworkFiles = [],
  imprintTemplates = [],
  onSaveTemplate,
  onUpdateImprintTemplate,
  lineItems = [],
  currentItemIndex,
  onDuplicateImprint,
  onMoveImprintToItem,
  onCopyImprintToItem,
}: DecorationManagerProps) {
  const [customInputs, setCustomInputs] = useState<Record<string, { location: boolean; method: boolean }>>({})
  const [collapsedDecorations, setCollapsedDecorations] = useState<Set<string>>(new Set())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const STANDARD_LOCATIONS = DEFAULT_LOCATIONS

  const addDecoration = () => {
    const defaultLocation = STANDARD_LOCATIONS[0] || 'Front'
    const newDecoration: Decoration = {
      id: generateId('dec'),
      method: 'screen-print',
      location: defaultLocation,
      inkThreadColors: '',
      setupFee: 0,
    }
    onChange([...decorations, newDecoration])
  }

  const duplicateDecoration = (decoration: Decoration) => {
    const duplicated: Decoration = {
      ...decoration,
      id: generateId('dec'),
      artwork: decoration.artwork ? { ...decoration.artwork } : undefined,
    }
    onChange([...decorations, duplicated])
    toast.success('Decoration duplicated')
  }

  const applyPreset = (preset: typeof DECORATION_PRESETS[0]) => {
    const newDecorations = preset.decorations.map(d => ({
      ...d,
      id: generateId('dec'),
    }))
    onChange([...decorations, ...newDecorations])
    toast.success(`Applied "${preset.name}" preset`)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newDecorations = [...decorations]
    const draggedItem = newDecorations[draggedIndex]
    newDecorations.splice(draggedIndex, 1)
    newDecorations.splice(index, 0, draggedItem)

    onChange(newDecorations)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const toggleCollapse = (id: string) => {
    setCollapsedDecorations(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const updateDecoration = (id: string, updates: Partial<Decoration>) => {
    onChange(decorations.map(d => d.id === id ? { ...d, ...updates } : d))
  }

  const removeDecoration = (id: string) => {
    const decoration = decorations.find(d => d.id === id)
    onChange(decorations.filter(d => d.id !== id))
    if (decoration) {
      const displayLocation = decoration.customLocation || decoration.location
      toast.success(`Decoration removed`, {
        description: `${displayLocation} decoration deleted`,
        duration: 3000,
      })
    }
  }

  const handleFileUpload = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const widthInches = (img.width / 300).toFixed(1)
        const heightInches = (img.height / 300).toFixed(1)
        const imprintSize = `${widthInches}" × ${heightInches}"`

        updateDecoration(id, {
          artwork: {
            dataUrl: e.target?.result as string,
            fileName: file.name,
            fileSize: file.size,
            width: img.width,
            height: img.height,
            uploadedAt: new Date().toISOString(),
          },
          imprintSize,
        })

        toast.success(`Artwork uploaded`, { description: `${file.name} - ${imprintSize}` })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const getSingleLineSummary = (decoration: Decoration): string => {
    const displayLocation = decoration.customLocation || decoration.location
    const displayMethod = decoration.customMethod || DECORATION_METHODS.find(m => m.value === decoration.method)?.label || decoration.method

    let summary = `${displayLocation} | ${displayMethod}`
    if (decoration.inkThreadColors) {
      summary += ` | ${decoration.inkThreadColors}`
    }
    if (decoration.artwork) {
      summary += ' | ✓ Art'
    }
    return summary
  }

  const isDecorationComplete = (decoration: Decoration): boolean => {
    return !!(
      decoration.location &&
      decoration.method &&
      decoration.inkThreadColors &&
      decoration.artwork
    )
  }

  const toggleCustomLocation = (id: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], location: !prev[id]?.location }
    }))
  }

  const toggleCustomMethod = (id: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], method: !prev[id]?.method }
    }))
  }

  return (
    <div className="space-y-3">
      {decorations.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No decorations added yet
        </div>
      )}

      {decorations.map((decoration, index) => {
        const isCollapsed = collapsedDecorations.has(decoration.id)
        const isComplete = isDecorationComplete(decoration)

        return (
          <div
            key={decoration.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`border rounded-lg bg-card/50 transition-all ${
              isComplete ? 'border-primary/30' : 'border-border'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => toggleCollapse(decoration.id)}>
              <button
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing p-1"
                draggable
                onDragStart={(e) => {
                  e.stopPropagation()
                  handleDragStart(index)
                }}
              >
                <DotsSixVertical size={16} weight="bold" />
              </button>

              <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1">
                {isCollapsed ? (
                  <CaretRight size={14} weight="bold" />
                ) : (
                  <CaretDown size={14} weight="bold" />
                )}
              </button>

              <div className="flex-1 min-w-0 text-xs text-foreground font-medium truncate">
                {getSingleLineSummary(decoration)}
              </div>

              {decoration.artwork && (
                <img
                  src={decoration.artwork.dataUrl}
                  alt="Preview"
                  className="w-8 h-8 object-contain bg-muted rounded flex-shrink-0"
                />
              )}

              <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {onDuplicateImprint ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateImprint(index)
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    title="Duplicate imprint"
                  >
                    <Copy size={14} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateDecoration(decoration)
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    title="Duplicate decoration"
                  >
                    <Copy size={14} />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeDecoration(decoration.id)
                  }}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  title="Delete decoration"
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      Location
                    </label>
                    {!customInputs[decoration.id]?.location ? (
                      <Select
                        value={decoration.location}
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            toggleCustomLocation(decoration.id)
                          } else {
                            updateDecoration(decoration.id, { location: value, customLocation: undefined })
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STANDARD_LOCATIONS.map(loc => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                          <SelectItem value="custom">Other (specify)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input
                          value={decoration.customLocation || ''}
                          onChange={(e) => updateDecoration(decoration.id, { customLocation: e.target.value, location: e.target.value })}
                          placeholder="Enter custom location"
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toggleCustomLocation(decoration.id)
                            updateDecoration(decoration.id, { location: 'Front', customLocation: undefined })
                          }}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      Method
                    </label>
                    {!customInputs[decoration.id]?.method ? (
                      <Select
                        value={decoration.method}
                        onValueChange={(value: DecorationType) => {
                          if (value === 'other') {
                            toggleCustomMethod(decoration.id)
                          } else {
                            updateDecoration(decoration.id, { method: value, customMethod: undefined })
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DECORATION_METHODS.map(method => (
                            <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input
                          value={decoration.customMethod || ''}
                          onChange={(e) => updateDecoration(decoration.id, { customMethod: e.target.value })}
                          placeholder="Enter custom method"
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toggleCustomMethod(decoration.id)
                            updateDecoration(decoration.id, { method: 'screen-print', customMethod: undefined })
                          }}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      Colors
                    </label>
                    <Input
                      value={decoration.inkThreadColors}
                      onChange={(e) => updateDecoration(decoration.id, { inkThreadColors: e.target.value })}
                      placeholder="e.g., White, Black"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                    Artwork {decoration.imprintSize && <span className="text-primary ml-1">({decoration.imprintSize})</span>}
                  </label>
                  {!decoration.artwork ? (
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-3 py-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Upload size={16} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Drag & drop or click to upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(decoration.id, e)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="border border-border rounded-lg p-2 bg-background">
                      <div className="flex items-start gap-2">
                        <img
                          src={decoration.artwork.dataUrl}
                          alt={decoration.artwork.fileName}
                          className="w-16 h-16 object-contain bg-muted rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs truncate">{decoration.artwork.fileName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                            {decoration.artwork.fileSize && (
                              <div>{(decoration.artwork.fileSize / 1024).toFixed(1)} KB</div>
                            )}
                            {decoration.imprintSize && (
                              <div className="flex items-center gap-1 text-primary">
                                <CheckCircle size={11} weight="fill" />
                                <span>{decoration.imprintSize}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="cursor-pointer">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              asChild
                            >
                              <div>
                                <Upload size={12} />
                              </div>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(decoration.id, e)}
                              className="hidden"
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateDecoration(decoration.id, { artwork: undefined, imprintSize: undefined })}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          >
                            <Trash size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={addDecoration}
          className="flex-1 h-8 text-xs"
        >
          <Plus size={14} className="mr-1.5" />
          Add Decoration
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 text-xs px-3">
              <Sparkle size={14} className="mr-1.5" />
              Templates
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Standard Templates
            </div>
            {DECORATION_PRESETS.map((preset) => (
              <DropdownMenuItem
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <div className="font-medium text-xs">{preset.name}</div>
                <div className="text-xs text-muted-foreground">{preset.description}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
