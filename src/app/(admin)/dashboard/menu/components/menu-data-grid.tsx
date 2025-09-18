'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  Settings2,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Wine,
  CheckCircle,
  XCircle,
  Utensils,
  Package,
  Plus,
  Minus,
  Coffee,
  Filter
} from 'lucide-react'
import { MenuItemWithAllergens } from '../schemas/menu-item.schema'
import { useCategories } from '../hooks/use-categories'

interface MenuDataGridProps {
  items: MenuItemWithAllergens[]
  loading?: boolean
  onItemEdit?: (item: MenuItemWithAllergens) => void
  onItemDelete?: (item: MenuItemWithAllergens) => void
  onItemToggleAvailability?: (itemId: string, isAvailable: boolean) => void
  onCreateWinePairing?: (foodItem: MenuItemWithAllergens) => void
  onViewWinePairings?: (item: MenuItemWithAllergens) => void
  onStockUpdate?: (itemId: string, newStock: number) => void
  onQuickStockAction?: (itemId: string, action: 'add5' | 'add10' | 'subtract5' | 'zero') => void
}

export function MenuDataGrid({
  items = [],
  loading = false,
  onItemEdit,
  onItemDelete,
  onItemToggleAvailability,
  onCreateWinePairing,
  onViewWinePairings,
  onStockUpdate,
  onQuickStockAction
}: MenuDataGridProps) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Categories data
  const { categories } = useCategories()

  // Filter items by selected category
  const filteredItems = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') {
      return items
    }
    return items.filter(item => item.categoryId === selectedCategory)
  }, [items, selectedCategory])

  // ✅ STABLE column definitions using useMemo with empty deps
  const columns = useMemo<ColumnDef<MenuItemWithAllergens>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(value) => row.toggleSelected(!!value.target.checked)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Nombre
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2 min-w-0">
            {/* Category type indicator */}
            {item.category?.type === 'FOOD' && <Utensils className="h-3 w-3 text-[#9FB289] flex-shrink-0" />}
            {item.category?.type === 'WINE' && <Wine className="h-3 w-3 text-[#CB5910] flex-shrink-0" />}
            {item.category?.type === 'BEVERAGE' && <div className="h-3 w-3 rounded-full bg-[#237584]/70 flex-shrink-0" />}

            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.name}</p>
              {item.nameEn && (
                <p className="text-xs text-muted-foreground truncate">{item.nameEn}</p>
              )}
            </div>

            {/* Dietary indicators */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.isVegetarian && (
                <Badge variant="secondary" className="text-xs px-1">V</Badge>
              )}
              {item.isVegan && (
                <Badge variant="secondary" className="text-xs px-1 bg-[#9FB289]/10 text-[#9FB289] dark:bg-[#9FB289]/20">VG</Badge>
              )}
              {item.isGlutenFree && (
                <Badge variant="secondary" className="text-xs px-1 bg-[#CB5910]/10 text-[#CB5910] dark:bg-[#CB5910]/20">GF</Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ row }) => {
        const category = row.original.category
        return category ? (
          <Badge
            variant="outline"
            className={`
              ${category.type === 'FOOD' ? 'bg-[#9FB289]/10 text-[#9FB289] border-[#9FB289]/30 dark:bg-[#9FB289]/20 dark:text-[#9FB289] dark:border-[#9FB289]/40' : ''}
              ${category.type === 'WINE' ? 'bg-[#CB5910]/10 text-[#CB5910] border-[#CB5910]/30 dark:bg-[#CB5910]/20 dark:text-[#CB5910] dark:border-[#CB5910]/40' : ''}
              ${category.type === 'BEVERAGE' ? 'bg-[#237584]/10 text-[#237584]/80 border-[#237584]/30 dark:bg-[#237584]/20 dark:text-[#237584]/80 dark:border-[#237584]/40' : ''}
            `}
          >
            {category.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground">Sin categoría</span>
        )
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Precio
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('price'))
        return (
          <div className="text-right font-medium">
            €{price.toFixed(2)}
          </div>
        )
      },
    },
    {
      accessorKey: 'allergens',
      header: 'Alérgenos',
      cell: ({ row }) => {
        const allergens = row.original.allergens || []
        return (
          <div className="flex flex-wrap gap-1 max-w-48">
            {allergens.length > 0 ? (
              allergens.slice(0, 3).map((allergen) => (
                <Badge key={allergen.id} variant="outline" className="text-xs">
                  {allergen.name}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">Ninguno</span>
            )}
            {allergens.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{allergens.length - 3}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Estado & Stock
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original
        const stock = item.stock || 0
        const isAvailable = item.isAvailable

        // Determine status priority: Disabled > Out of Stock > Low Stock > Available
        let status, icon, textColor, bgColor, stockInfo

        if (!isAvailable) {
          status = 'Deshabilitado'
          icon = <XCircle className="h-4 w-4" />
          textColor = 'text-muted-foreground'
          bgColor = 'bg-muted/20 border-muted dark:bg-muted/10 dark:border-muted'
          stockInfo = `Stock: ${stock}`
        } else if (stock === 0) {
          status = 'Sin Stock'
          icon = <Package className="h-4 w-4" />
          textColor = 'text-destructive'
          bgColor = 'bg-destructive/10 border-destructive/30 dark:bg-destructive/20 dark:border-destructive/40'
          stockInfo = '¡Reponer!'
        } else if (stock < 10) {
          status = 'Stock Bajo'
          icon = <Package className="h-4 w-4" />
          textColor = 'text-[#CB5910]'
          bgColor = 'bg-[#CB5910]/10 border-[#CB5910]/30 dark:bg-[#CB5910]/20 dark:border-[#CB5910]/40'
          stockInfo = `${stock} unidades`
        } else {
          status = 'Disponible'
          icon = <CheckCircle className="h-4 w-4" />
          textColor = 'text-[#9FB289]'
          bgColor = 'bg-[#9FB289]/10 border-[#9FB289]/30 dark:bg-[#9FB289]/20 dark:border-[#9FB289]/40'
          stockInfo = `${stock} unidades`
        }

        return (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md border ${bgColor}`}>
            <div className={textColor}>
              {icon}
            </div>
            <div className="flex flex-col">
              <span className={`font-medium text-sm ${textColor}`}>
                {status}
              </span>
              <span className="text-xs text-muted-foreground">
                {stockInfo}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem
                onClick={() => onItemEdit?.(item)}
                className="cursor-pointer"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Editar elemento
              </DropdownMenuCheckboxItem>

              {/* Wine Pairing Actions */}
              {item.category?.type === 'FOOD' && onCreateWinePairing && (
                <DropdownMenuCheckboxItem
                  onClick={() => onCreateWinePairing(item)}
                  className="cursor-pointer"
                >
                  <Wine className="mr-2 h-4 w-4" />
                  Crear Maridaje
                </DropdownMenuCheckboxItem>
              )}

              {(item.category?.type === 'FOOD' || item.category?.type === 'WINE') && onViewWinePairings && (
                <DropdownMenuCheckboxItem
                  onClick={() => onViewWinePairings(item)}
                  className="cursor-pointer"
                >
                  <Wine className="mr-2 h-4 w-4" />
                  Ver Maridajes
                </DropdownMenuCheckboxItem>
              )}

              {/* Stock Management Actions */}
              {onQuickStockAction && (
                <>
                  <div className="border-t my-1" />
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Gestión de Stock
                  </div>
                  <DropdownMenuCheckboxItem
                    onClick={() => onQuickStockAction(item.id, 'add10')}
                    className="cursor-pointer text-[#9FB289]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    +10 unidades
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onClick={() => onQuickStockAction(item.id, 'add5')}
                    className="cursor-pointer text-[#9FB289]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    +5 unidades
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onClick={() => onQuickStockAction(item.id, 'subtract5')}
                    className="cursor-pointer text-[#CB5910]"
                    disabled={item.stock < 5}
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    -5 unidades
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onClick={() => onQuickStockAction(item.id, 'zero')}
                    className="cursor-pointer text-destructive"
                    disabled={item.stock === 0}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Marcar sin stock
                  </DropdownMenuCheckboxItem>
                  <div className="border-t my-1" />
                </>
              )}

              <DropdownMenuCheckboxItem
                onClick={() => onItemToggleAvailability?.(item.id, !item.isAvailable)}
                className="cursor-pointer"
              >
                {item.isAvailable ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Marcar no disponible
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Marcar disponible
                  </>
                )}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onClick={() => onItemDelete?.(item)}
                className="cursor-pointer text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar elemento
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [onItemEdit, onItemDelete, onItemToggleAvailability, onCreateWinePairing, onViewWinePairings]) // Stable dependencies

  // ✅ STABLE data reference using useMemo with filtered items
  const stableData = useMemo(() => filteredItems || [], [filteredItems])

  // Create table instance
  const table = useReactTable({
    data: stableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar elementos..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {selectedCategory
                  ? categories.find(cat => cat.id === selectedCategory)?.name || 'Categoría'
                  : 'Todas las categorías'
                }
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuCheckboxItem
                checked={!selectedCategory || selectedCategory === 'all'}
                onCheckedChange={() => setSelectedCategory('')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted-foreground" />
                  Todas las categorías
                </div>
              </DropdownMenuCheckboxItem>
              <div className="border-t my-1" />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={selectedCategory === category.id}
                  onCheckedChange={() =>
                    setSelectedCategory(selectedCategory === category.id ? '' : category.id)
                  }
                >
                  <div className="flex items-center gap-2">
                    {category.type === 'FOOD' && <Utensils className="w-4 h-4 text-[#9FB289]" />}
                    {category.type === 'WINE' && <Wine className="w-4 h-4 text-[#CB5910]" />}
                    {category.type === 'BEVERAGE' && <Coffee className="w-4 h-4 text-[#237584]/70" />}
                    <span className="flex-1">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {items.filter(item => item.categoryId === category.id).length}
                    </span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-16"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron elementos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <select
              value={`${table.getState().pagination.pageSize}`}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}