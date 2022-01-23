import React, { useEffect, useState } from 'react';
import { usePromiseCallback } from '../../hooks';
import { jsonFetch } from '../../lib/client/api';
import { PaginatedTableLayout } from './PaginatedTableLayout';

export function DynamicPaginatedTable(
  {
    url,
    params,
    initialResultsPerPage = 10,
    initialPage = 1,
    rowsFrom = data => data.data,
    totalFrom = data => data.pagination.total,
    paginationFrom = data => data.pagination,
    columns,
    totalCallback,
    renderEmpty,
    ...rest
  }) {

  const [page, setPage] = useState(initialPage);
  const [{ isLoading, isError, data, error }, dispatcher] = usePromiseCallback((url, query) => jsonFetch(url, { query }), []);

  const [resultsPerPage, setResultsPerPage] = useState(initialResultsPerPage);

  useEffect(() => {
    dispatcher(url, params && params(page, resultsPerPage));
  }, [url, params, page, resultsPerPage]);

  useEffect(() => {
    if(totalCallback) {
      totalCallback(data !== null ? totalFrom(data) : null);
    }
  }, [data, totalCallback, totalFrom]);

  return (
    <PaginatedTableLayout
      isLoading={isLoading || (!data && !isError)}
      isError={isError}
      error={error}
      resultsPerPage={resultsPerPage}
      onResultsPerPageChange={setResultsPerPage}
      onPageChange={setPage}
      rows={data && rowsFrom(data)}
      totalRows={data && totalFrom(data)}
      page={data && (paginationFrom ? paginationFrom(data).page : 1)}
      pageCount={data && (paginationFrom ? paginationFrom(data).pageCount : 1)}
      columns={columns}
      renderEmpty={renderEmpty}
      {...rest}
    />
  );
}
