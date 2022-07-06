import React, { useCallback, useMemo, useState } from 'react';
import { PaginatedTableLayout } from './PaginatedTableLayout';

export function StaticPaginatedTable({
  rows,
  columns,
  initialResultsPerPage = 10,
  initialPage = 1,
  filters = [],
  filter = () => true,
  renderEmpty,
  ...rest
}) {
  const [state, setState] = useState({
    page: initialPage,
    resultsPerPage: initialResultsPerPage,
    filtersValues: Object.fromEntries(filters.flatMap(({ children }) => children).map(({ name, initial }) => [name, initial !== undefined ? initial : false])),
  });
  const setPartialState = useCallback(values => setState({ ...state, ...values }), [state, setState]);

  const filteredRows = useMemo(() => rows.filter(row => filter(row, state.filtersValues)), [filter, rows, state]);

  return (
    <PaginatedTableLayout
      resultsPerPage={state.resultsPerPage}
      onResultsPerPageChange={newResultsPerPage => setPartialState({ page: initialPage, resultsPerPage: newResultsPerPage })}
      onPageChange={newPage => setPartialState({ page: newPage })}
      rows={filteredRows.slice((state.page - 1) * state.resultsPerPage, state.page * state.resultsPerPage)}
      totalRows={filteredRows.length}
      page={state.page}
      pageCount={Math.ceil(filteredRows.length / state.resultsPerPage)}
      filters={filters}
      filtersValues={state.filtersValues}
      onFilterValueChange={(name, value) => setPartialState({ page: initialPage, filtersValues: { ...state.filtersValues, [name]: value } })}
      columns={columns}
      renderEmpty={renderEmpty}
      {...rest}
    />
  );
}
