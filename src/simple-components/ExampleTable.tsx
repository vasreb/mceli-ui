import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
} from '@mui/material';
import { useState } from 'react';
import styles from './ExampleTable.module.scss';

interface Person {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
}

const data: Person[] = [
  { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', age: 28, role: 'Разработчик' },
  { id: 2, name: 'Мария Петрова', email: 'maria@example.com', age: 32, role: 'Дизайнер' },
  { id: 3, name: 'Алексей Сидоров', email: 'alex@example.com', age: 25, role: 'Менеджер' },
  { id: 4, name: 'Елена Козлова', email: 'elena@example.com', age: 30, role: 'Разработчик' },
  { id: 5, name: 'Дмитрий Волков', email: 'dmitry@example.com', age: 35, role: 'Архитектор' },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Имя',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('age', {
    header: 'Возраст',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('role', {
    header: 'Роль',
    cell: (info) => info.getValue(),
  }),
];

export function ExampleTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <TablePagination
          component="div"
          count={table.getFilteredRowModel().rows.length}
          page={pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    </TableContainer>
  );
}

