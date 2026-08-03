"use client";

import * as React from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Columns3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IAO_BAND_LABELS, IPP_BAND_LABELS } from "@/lib/result-labels";

export interface AnalysisRow {
  id: string;
  type: "profile_analysis" | "job_analysis";
  title: string;
  createdAt: string;
  status: string;
  score: number | null;
  band: string | null;
  href: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  queued: "Na fila",
  processing: "Em processamento",
  preliminary: "Preliminar",
  completed: "Concluída",
  insufficient_data: "Dados insuficientes",
  failed_retryable: "Falha — pode tentar novamente",
  failed_final: "Falha",
  cancelled: "Cancelada",
};

const columns: ColumnDef<AnalysisRow>[] = [
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground">
        {row.original.type === "profile_analysis" ? "Análise de Perfil" : "Diagnóstico de Aderência"}
      </Badge>
    ),
  },
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.title}</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="tertiary" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Data
        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "completed" ? "success" : "outline"}>
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <Button variant="tertiary" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Resultado
        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      if (row.original.score === null) return <span className="text-muted-foreground">—</span>;
      const bandLabel =
        row.original.type === "profile_analysis"
          ? IPP_BAND_LABELS[row.original.band ?? ""]
          : IAO_BAND_LABELS[row.original.band ?? ""];
      return (
        <span className="text-foreground">
          {row.original.score}
          {bandLabel ? <span className="ml-1 text-xs text-muted-foreground">({bandLabel})</span> : null}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Ação</span>,
    cell: ({ row }) =>
      row.original.href ? (
        <Button asChild size="sm" variant="secondary">
          <Link href={row.original.href}>Ver resultado</Link>
        </Button>
      ) : null,
  },
];

export function AnalysesDataTable({ data }: { data: AnalysisRow[] }) {
  const [tab, setTab] = React.useState("todas");
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const filteredData = React.useMemo(() => {
    if (tab === "perfil") return data.filter((r) => r.type === "profile_analysis");
    if (tab === "aderencia") return data.filter((r) => r.type === "job_analysis");
    return data;
  }, [data, tab]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) =>
      row.original.title.toLowerCase().includes(String(filterValue).toLowerCase()),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Todas as análises</CardTitle>
            <CardDescription>Filtre, ordene e busque no seu histórico completo</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                <Columns3 className="h-4 w-4" />
                <span className="hidden sm:inline">Colunas</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {String(column.columnDef.header) || column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="perfil">Análise de Perfil</TabsTrigger>
              <TabsTrigger value="aderencia">Diagnóstico de Aderência</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            placeholder="Buscar por título..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 sm:w-64"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Nenhuma análise encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} análise(s) no total
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium text-foreground">Linhas por página</span>
              <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(v) => table.setPageSize(Number(v))}>
                <SelectTrigger size="sm" className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm font-medium text-foreground">
              Página {table.getState().pagination.pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" className="hidden size-8 p-0 sm:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" className="size-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" className="size-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" className="hidden size-8 p-0 sm:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
