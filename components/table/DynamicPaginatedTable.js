import React, { useCallback, useEffect, useState } from 'react';
import { usePromiseCallback } from '../../hooks';
import { jsonFetch } from '../../lib/client/api';
import { PaginatedTableLayout } from './PaginatedTableLayout';

export function DynamicPaginatedTable({
  url,
  params,
  initialResultsPerPage = 10,
  initialPage = 1,
  rowsFrom = data => data.data,
  totalFrom = data => data.pagination.total,
  paginationFrom = data => data.pagination,
  filters = [],
  columns,
  totalCallback,
  renderEmpty,
  ...rest
}) {
  const [state, setState] = useState({
    page: initialPage,
    resultsPerPage: initialResultsPerPage,
    filtersValues: Object.fromEntries(filters.flatMap(({ children }) => children).map(({ name, initial }) => [name, initial !== undefined ? initial : false])),
  });
  const setPartialState = useCallback(values => setState({ ...state, ...values }), [state, setState]);

  const [{ isLoading, isError, data, error }, dispatcher] = usePromiseCallback((urlParameter, query) => jsonFetch(urlParameter, { query }), []);

  useEffect(() => {
    dispatcher(url, params && params(state.page, state.resultsPerPage, state.filtersValues));
  }, [dispatcher, url, params, state]);

  useEffect(() => {
    if (totalCallback) {
      totalCallback(data !== null ? totalFrom(data) : null);
    }
  }, [data, totalCallback, totalFrom]);

  return (
    <PaginatedTableLayout
      isLoading={isLoading || (!data && !isError)}
      isError={isError}
      error={error}
      resultsPerPage={state.resultsPerPage}
      onResultsPerPageChange={newResultsPerPage => setPartialState({ page: initialPage, resultsPerPage: newResultsPerPage })}
      onPageChange={newPage => setPartialState({ page: newPage })}
      rows={data && rowsFrom(data)}
      totalRows={data && totalFrom(data)}
      page={data && (paginationFrom ? paginationFrom(data).page : 1)}
      pageCount={data && (paginationFrom ? paginationFrom(data).pageCount : 1)}
      filters={filters}
      filtersValues={state.filtersValues}
      onFilterValueChange={(filter, value) => setPartialState({ page: initialPage, filtersValues: { ...state.filtersValues, [filter]: value } })}
      columns={columns}
      renderEmpty={renderEmpty}
      {...rest}
    />
  );
}
