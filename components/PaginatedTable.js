import React, { useEffect, useState } from 'react';
import { Pagination, Spinner, Table } from 'react-bootstrap';
import { useDataApi, useNonInitialEffect } from '../hooks';
import { ErrorMessage } from './ErrorMessage';

export function PaginatedTable({ url, params, initialResultsPerPage = 25, initialPage = 1, rowsFrom = data => data.data, totalFrom = data => data.pagination.total, paginationFrom = data => data.pagination, columns, totalCallback }) {
  const [page, setPage] = useState(initialPage);
  const [{ isLoading, isError, data, error }, setUrl] = useDataApi(url, params && params(page, initialResultsPerPage));
  const [resultsPerPage, setResultsPerPage] = useState(initialResultsPerPage);

  useNonInitialEffect(() => {
    setUrl(params && params(page, resultsPerPage));
  }, [setUrl, page, resultsPerPage]); // We don't listen for `params` as it creates an infinite render loop (and is not even needed)

  useEffect(() => {
    if(totalCallback) {
      totalCallback(data !== null ? totalFrom(data) : null);
    }
  }, [data, totalCallback, totalFrom]);

  const renderPagination = () => {
    if(!paginationFrom) {
      return null;
    }
    const { pageCount, page } = paginationFrom(data);
    if(pageCount <= 1) {
      return null;
    }

    const pageSet = new Set();
    const radiusPage = 2, radiusExtremity = 1;
    for(let i = page - radiusPage + 1; i <= page + radiusPage - 1; i++) {
      pageSet.add(i);
    }
    for(let i = 0; i < radiusExtremity; i++) {
      pageSet.add(1 + i);
      pageSet.add(pageCount - i);
    }

    const visiblePages = Array.from(pageSet).filter(i => i >= 1 && i <= pageCount).sort();

    return (
      <Pagination className="justify-content-center">
        <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />

        {visiblePages.map((visiblePage, i) => (
          <React.Fragment key={visiblePage}>
            <Pagination.Item active={page === visiblePage} onClick={() => setPage(visiblePage)}>{visiblePage}</Pagination.Item>
            {i < visiblePages.length - 1 && visiblePage + 1 !== visiblePages[i + 1] && (
              <Pagination.Ellipsis disabled />
            )}
          </React.Fragment>
        ))}

        <Pagination.Next disabled={page === pageCount} onClick={() => setPage(page + 1)} />
      </Pagination>
    );
  };

  return isLoading ? (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" className="m-4" />
      </div>
    ) : isError ? (
      <ErrorMessage error={error} />
    ) : (
    <>
      <Table striped bordered responsive>
        <thead>
        <tr>
          {columns.map(({ title }, i) => (
            <th key={i}>{title}</th>
          ))}
        </tr>
        </thead>
        <tbody className="align-middle">
        {rowsFrom(data).map((rowData, i) => (
          <tr key={i}>
            {columns.map(({ render, props }, i) => (
              <td key={i} {...(props ?? {})}>{render(rowData)}</td>
            ))}
          </tr>
        ))}
        </tbody>
      </Table>

      {renderPagination()}
    </>
  );
}
