import React, { useEffect, useState } from 'react';
import { useDataApi, useNonInitialEffect } from '../../hooks';
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
  }) {

  const [page, setPage] = useState(initialPage);
  const [{ isLoading, isError, data, error }, setUrl] = useDataApi(url, params && params(page, initialResultsPerPage));
  const [resultsPerPage, setResultsPerPage] = useState(initialResultsPerPage);

  useNonInitialEffect(() => {
    setUrl(params && params(page, resultsPerPage));
  }, [url, params, setUrl, page, resultsPerPage]);

  useEffect(() => {
    if(totalCallback) {
      totalCallback(data !== null ? totalFrom(data) : null);
    }
  }, [data, totalCallback, totalFrom]);

  return (
    <PaginatedTableLayout
      isLoading={isLoading}
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
    />
  );
}
