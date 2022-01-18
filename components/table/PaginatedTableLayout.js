import React from 'react';
import { Pagination, Spinner, Table } from 'react-bootstrap';
import { ErrorMessage } from '../ErrorMessage';

export function PaginatedTableLayout(
  {
    isLoading,
    isDisabled,
    isError,
    error,
    resultsPerPage = 10,
    onResultsPerPageChange,
    onPageChange,
    rows,
    totalRows,
    page,
    pageCount,
    columns,
    collapsePagination = true,
  }) {

  const renderPagination = () => {
    if(pageCount <= 1 && collapsePagination) {
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

    const visiblePages = Array.from(pageSet).filter(i => i >= 1 && i <= pageCount).sort((a, b) => a - b);

    return (
      <Pagination className="justify-content-center">
        <Pagination.Prev disabled={page === 1 || isDisabled || isLoading} onClick={() => onPageChange(page - 1)} />

        {visiblePages.map((visiblePage, i) => (
          <React.Fragment key={visiblePage}>
            <Pagination.Item active={page === visiblePage} disabled={isDisabled || isLoading} onClick={() => onPageChange(visiblePage)}>{visiblePage}</Pagination.Item>
            {i < visiblePages.length - 1 && visiblePage + 1 !== visiblePages[i + 1] && (
              <Pagination.Ellipsis disabled />
            )}
          </React.Fragment>
        ))}

        <Pagination.Next disabled={page === pageCount || isDisabled || isLoading} onClick={() => onPageChange(page + 1)} />
      </Pagination>
    );
  };

  return isLoading && !rows ? (
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
        <tbody className={`align-middle ${isLoading ? 'opacity-50' : ''}`}>
        {rows.map((rowData, i) => (
          <tr key={i}>
            {columns.map(({ render, props }, i) => (
              <td key={i} {...(props ?? {})}>{render(rowData, isDisabled || isLoading)}</td>
            ))}
          </tr>
        ))}
        </tbody>
      </Table>

      {renderPagination()}
    </>
  );
}
