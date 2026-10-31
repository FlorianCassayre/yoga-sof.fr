import type { GridColDef } from '@mui/x-data-grid';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDataGrid } from '../../../components/grid/useDataGrid';

interface Row {
  capacity: number;
}

const columns: (GridColDef<Row> & { field: keyof Row | 'actions' })[] = [{ field: 'capacity' }];

const defaultSort = { field: 'capacity', sort: 'asc' } as const;

const details = { api: undefined as never, apiRef: undefined as never };

describe('useDataGrid', () => {
  it('resets the page when the page size changes', () => {
    const { result, rerender } = renderHook(() =>
      useDataGrid<Row, 'capacity'>(columns, defaultSort),
    );

    expect(result.current.queryInput).toEqual({
      page: 0,
      pageSize: 10,
      sort: [{ field: 'capacity', sort: 'asc' }],
    });

    act(() => {
      result.current
        .dataGridProps({ isFetching: false })
        .onPaginationModelChange?.({ page: 2, pageSize: 20 }, details);
    });
    rerender();

    expect(result.current.queryInput).toEqual({
      page: 0,
      pageSize: 20,
      sort: [{ field: 'capacity', sort: 'asc' }],
    });
  });

  it('maps the sort model to the query input', () => {
    const { result, rerender } = renderHook(() =>
      useDataGrid<Row, 'capacity'>(columns, defaultSort),
    );

    act(() => {
      result.current
        .dataGridProps({ isFetching: false })
        .onSortModelChange?.([{ field: 'capacity', sort: 'desc' }], details);
    });
    rerender();

    expect(result.current.queryInput.sort).toEqual([{ field: 'capacity', sort: 'desc' }]);
  });

  it('snaps back to the default sort when the sort model is empty or invalid', () => {
    const { result, rerender } = renderHook(() =>
      useDataGrid<Row, 'capacity'>(columns, defaultSort),
    );

    act(() => {
      result.current.dataGridProps({ isFetching: false }).onSortModelChange?.([], details);
    });
    rerender();

    expect(result.current.dataGridProps({ isFetching: false }).sortModel).toEqual([
      { field: 'capacity', sort: 'asc' },
    ]);
    expect(result.current.queryInput.sort).toEqual([{ field: 'capacity', sort: 'asc' }]);

    act(() => {
      result.current
        .dataGridProps({ isFetching: false })
        .onSortModelChange?.([{ field: 'capacity', sort: undefined }], details);
    });
    rerender();

    expect(result.current.dataGridProps({ isFetching: false }).sortModel).toEqual([
      { field: 'capacity', sort: 'asc' },
    ]);
    expect(result.current.queryInput.sort).toEqual([{ field: 'capacity', sort: 'asc' }]);
  });
});
