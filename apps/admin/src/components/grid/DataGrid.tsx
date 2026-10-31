'use client';

import { Alert, Stack } from '@mui/material';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';
import type { skipToken } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import type { PaginatedListResult } from '@yoga-sof/core';

import { type ListQueryInput, useDataGrid } from './useDataGrid';

export interface ListProcedure<Row extends GridValidRowModel> {
  useQuery(
    input: ListQueryInput<string> | typeof skipToken,
    options?: unknown,
  ): { data?: PaginatedListResult<Row>; error?: unknown; isFetching: boolean };
}

interface DataGridProps<Row extends GridValidRowModel> {
  columns: GridColDef<Row>[];
  defaultSort: { field: keyof Row & string; sort: 'asc' | 'desc' };
  procedure: ListProcedure<Row>;
}

export const DataGrid = <Row extends GridValidRowModel>({
  columns,
  defaultSort,
  procedure,
}: DataGridProps<Row>) => {
  const grid = useDataGrid<Row, string>(columns, defaultSort);
  const query = procedure.useQuery(grid.queryInput, { placeholderData: keepPreviousData });

  const error = query.error;
  const ErrorOverlay = () => (
    <Stack sx={{ alignItems: 'center', height: '100%', justifyContent: 'center', p: 2 }}>
      <Alert severity="error" sx={{ width: '100%' }}>
        {error instanceof Error ? error.message : 'Une erreur est survenue.'}
      </Alert>
    </Stack>
  );

  return (
    <MuiDataGrid
      {...grid.dataGridProps(query)}
      slots={error ? { noRowsOverlay: ErrorOverlay } : undefined}
    />
  );
};
