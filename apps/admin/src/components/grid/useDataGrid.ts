'use client';

import type {
  DataGridProps,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import type { PaginatedListParams, PaginatedListResult } from '@yoga-sof/core';
import { useState } from 'react';

export interface ListQueryInput<SortField extends string> extends PaginatedListParams {
  sort?: { field: SortField; sort: 'asc' | 'desc' }[];
}

interface ListQueryResult<Row extends GridValidRowModel> {
  data?: PaginatedListResult<Row>;
  isFetching: boolean;
}

export const useDataGrid = <Row extends GridValidRowModel, SortField extends string>(
  columns: (GridColDef<Row> & { field: keyof Row | 'actions' })[],
  defaultSort: { field: SortField; sort: 'asc' | 'desc' },
) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<{ field: SortField; sort: 'asc' | 'desc' }[]>([
    defaultSort,
  ]);

  const paginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel((previous) =>
      model.pageSize === previous.pageSize ? model : { ...model, page: 0 },
    );
  };

  const sortModelChange = (model: GridSortModel) => {
    const sort = model.flatMap(({ field, sort }) =>
      sort === 'asc' || sort === 'desc' ? [{ field: field as SortField, sort }] : [],
    );
    setSortModel(sort.length === 0 ? [defaultSort] : sort);
  };

  const queryInput: ListQueryInput<SortField> = {
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    sort: sortModel,
  };

  const dataGridProps = ({ data, isFetching }: ListQueryResult<Row>): DataGridProps<Row> => ({
    rows: data?.rows ?? [],
    columns,
    rowCount: data?.total ?? 0,
    paginationModel,
    onPaginationModelChange: paginationModelChange,
    sortModel,
    onSortModelChange: sortModelChange,
    loading: isFetching,
  });

  return { queryInput, dataGridProps };
};
