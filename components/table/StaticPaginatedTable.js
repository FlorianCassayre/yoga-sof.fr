import React, { useCallback, useMemo, useState } from 'react';
import { PaginatedTableLayout } from './PaginatedTableLayout';

export function StaticPaginatedTable({
  rows,
  columns,
  initialResultsPerPage = 10,
  initialPage = 1,
  filters = [],
  filter = () => true,
  comparator = () => 0,
  renderEmpty,
  ...rest
}) {
  const [state, setState] = useState({
    page: initialPage,
    resultsPerPage: initialResultsPerPage,
    filtersValues: Object.fromEntries(filters.flatMap(({ children }) => children).map(({ name, initial }) => [name, initial !== undefined ? initial : false])),
    sortValue: columns.filter(({ initialSortValue }) => initialSortValue != null).map(({ name, initialSortValue }) => ({ column: name, order: initialSortValue }))[0] ?? null,
  });
  const setPartialState = useCallback(values => setState({ ...state, ...values }), [state, setState]);

  const filteredRows = useMemo(() => rows.filter(row => filter(row, state.filtersValues)), [filter, rows, state]);
  const sortedRows = useMemo(() => filteredRows.sort((a, b) => comparator(a, b, state.sortValue)), [comparator, filteredRows, state]);

  return (
    <PaginatedTableLayout
      resultsPerPage={state.resultsPerPage}
      onResultsPerPageChange={newResultsPerPage => setPartialState({ page: initialPage, resultsPerPage: newResultsPerPage })}
      onPageChange={newPage => setPartialState({ page: newPage })}
      rows={sortedRows.slice((state.page - 1) * state.resultsPerPage, state.page * state.resultsPerPage)}
      totalRows={sortedRows.length}
      page={state.page}
      pageCount={Math.ceil(sortedRows.length / state.resultsPerPage)}
      filters={filters}
      filtersValues={state.filtersValues}
      onFilterValueChange={(name, value) => setPartialState({ page: initialPage, filtersValues: { ...state.filtersValues, [name]: value } })}
      sortValue={state.sortValue}
      onSortByChange={sortValue => setPartialState({ sortValue })}
      columns={columns}
      renderEmpty={renderEmpty}
      {...rest}
    />
  );
}
