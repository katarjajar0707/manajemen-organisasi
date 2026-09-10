'use client';

import { useMemo, useState } from 'react';
import {
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  useTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserFormModal } from './user-form-modal';
import { DeleteUserButton } from './delete-user-button';

type BagianOption = { id: string; nama: string };

type UserRecord = {
  id: string;
  nama: string;
  username?: string;
  email?: string;
  nomor_wa?: string;
  role: string;
  bagian_id: string | null;
  bagian?: { id?: string; nama?: string } | null;
};

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
});

function roleVariant(role: string) {
  return role === 'admin' ? 'default' : role === 'ketua' ? 'destructive' : 'secondary';
}

export function UserDataTable({ users, bagianList }: { users: UserRecord[]; bagianList: BagianOption[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo<ColumnDef<typeof features, UserRecord>[]>(
    () => [
      {
        id: 'select',
        enableSorting: false,
        enableColumnFilter: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Pilih semua pengguna pada halaman ini"
            checked={table.getIsAllPageRowsSelected()}
            ref={(element) => {
              if (element) element.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 accent-primary"
          />
        ),
        cell: ({ row }) => <input type="checkbox" aria-label={`Pilih ${row.original.nama}`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="h-4 w-4 accent-primary" />,
      },
      {
        accessorKey: 'nama',
        header: ({ column }) => (
          <Button variant="ghost" className="h-8 px-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Nama
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.nama}</div>
            <div className="text-[10px] text-muted-foreground">@{row.original.username || '-'}</div>
          </div>
        ),
      },
      {
        id: 'kontak',
        accessorFn: (row) => `${row.email || ''} ${row.username || ''}`,
        header: 'Email / Username',
        cell: ({ row }) => (
          <div className="text-xs">
            <div className="text-muted-foreground">{row.original.email || '-'}</div>
            <div className="text-[10px] text-muted-foreground/60">@{row.original.username || '-'}</div>
          </div>
        ),
      },
      {
        id: 'bagian',
        accessorFn: (row) => row.bagian?.nama || '',
        header: 'Bagian',
        cell: ({ row }) => row.original.bagian?.nama || '-',
      },
      {
        accessorKey: 'role',
        header: ({ column }) => (
          <Button variant="ghost" className="h-8 px-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Role
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant={roleVariant(row.original.role)} className="capitalize">
            {row.original.role}
          </Badge>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <UserFormModal
                bagianList={bagianList}
                mode="edit"
                userToEdit={{
                  id: user.id,
                  nama: user.nama,
                  username: user.username,
                  email: user.email,
                  nomor_wa: user.nomor_wa,
                  role: user.role,
                  bagian_id: user.bagian_id,
                }}
              />
              <DeleteUserButton userId={user.id} userName={user.nama} />
            </div>
          );
        },
      },
    ],
    [bagianList],
  );

  const table = useTable({
    data: users,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _columnId, filterValue) => {
      const user = row.original;
      const searchable = [user.nama, user.username, user.email, user.role, user.bagian?.nama].filter(Boolean).join(' ').toLowerCase();
      return searchable.includes(String(filterValue).toLowerCase());
    },
    enableRowSelection: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    features,
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Filter nama, email, username, role..." className="max-w-sm" aria-label="Filter pengguna" />
        <span className="text-xs text-muted-foreground">
          {Object.keys(rowSelection).length} dipilih dari {table.getFilteredRowModel().rows.length} pengguna
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada pengguna yang cocok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground">
          Halaman {table.state.pagination.pageIndex + 1} dari {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          <select value={table.state.pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))} className="h-8 rounded-md border border-border bg-background px-2 text-xs" aria-label="Jumlah baris per halaman">
            {[10, 20, 30].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} / halaman
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Halaman sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Halaman berikutnya">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
