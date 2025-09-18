'use client'

import { useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Wine,
  UtensilsCrossed,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2
} from 'lucide-react'
import { WinePairingWithItems } from '../schemas/wine-pairing.schema'

interface WinePairingDataGridProps {
  pairings: WinePairingWithItems[]
  loading?: boolean
  onViewPairing?: (pairing: WinePairingWithItems) => void
  onEditPairing?: (pairing: WinePairingWithItems) => void
  onDeletePairing?: (pairing: WinePairingWithItems) => void
}

export function WinePairingDataGrid({
  pairings,
  loading = false,
  onViewPairing,
  onEditPairing,
  onDeletePairing
}: WinePairingDataGridProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Stable column definitions using useMemo to prevent infinite renders
  const columns = useMemo<ColumnDef<WinePairingWithItems>[]>(() => [
    {
      id: 'foodItem',
      accessorKey: 'foodItem.name',
      header: 'Plato',
      cell: ({ row }) => {
        const foodItem = row.original.foodItem
        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <UtensilsCrossed className="w-4 h-4 text-[#9FB289] flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">{foodItem.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {foodItem.category?.name}
              </div>
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false
    },
    {
      id: 'wineItem',
      accessorKey: 'wineItem.name',
      header: 'Vino',
      cell: ({ row }) => {
        const wineItem = row.original.wineItem
        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <Wine className="w-4 h-4 text-[#CB5910] flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">{wineItem.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {wineItem.category?.name}
              </div>
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ getValue }) => {
        const description = getValue() as string
        return (
          <div className="max-w-[300px]">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description || 'Sin descripción'}
            </p>
          </div>
        )
      },
      enableSorting: false
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const pairing = row.original
        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onViewPairing && (
                  <DropdownMenuItem
                    onClick={() => onViewPairing(pairing)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </DropdownMenuItem>
                )}
                {onEditPairing && (
                  <DropdownMenuItem
                    onClick={() => onEditPairing(pairing)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDeletePairing && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeletePairing(pairing)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false
    }
  ], [onViewPairing, onEditPairing, onDeletePairing])

  // Table instance with stable reference
  const table = useReactTable({
    data: pairings,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-[250px] h-9 bg-muted animate-pulse rounded-md" />
          <div className="w-[100px] h-9 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Buscar maridajes..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Settings2 className="mr-2 h-4 w-4" />
              Columnas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
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
                  <div className="flex flex-col items-center gap-2">
                    <Wine className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay maridajes configurados</p>
                    <p className="text-sm text-muted-foreground">
                      Comienza creando tu primer maridaje entre un plato y un vino
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length > 0 ? (
            <>
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              de {table.getFilteredRowModel().rows.length} maridaje{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
            </>
          ) : (
            'No hay maridajes para mostrar'
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}