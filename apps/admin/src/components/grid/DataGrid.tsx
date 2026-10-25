'use client';

import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';
import type { skipToken, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import type { PaginatedListResult } from '@yoga-sof/core';

import { type ListQueryInput, useDataGrid } from './useDataGrid';

interface ListProcedure<Row extends GridValidRowModel> {
  useQuery(
    input: ListQueryInput<string> | typeof skipToken,
    options?: unknown,
  ): UseQueryResult<PaginatedListResult<Row>, unknown>;
}

interface DataGridProps<Row extends GridValidRowModel> {
  columns: GridColDef<Row>[];
  procedure: ListProcedure<Row>;
}

export const DataGrid = <Row extends GridValidRowModel>({
  columns,
  procedure,
}: DataGridProps<Row>) => {
  const grid = useDataGrid<Row, string>(columns);
  const query = procedure.useQuery(grid.queryInput, { placeholderData: keepPreviousData });

  return <MuiDataGrid {...grid.dataGridProps(query)} />;
};
