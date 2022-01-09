import { useEffect, useState } from 'react';
import { Spinner, Table } from 'react-bootstrap';
import { useDataApi, useNonInitialEffect } from '../hooks';
import { ErrorMessage } from './ErrorMessage';

export function PaginatedTable({ url, params, initialResultsPerPage = 10, initialPage = 1, rowsFrom = data => data.data, totalFrom = data => data.pagination.total, columns, totalCallback }) {
  const [page, setPage] = useState(1);
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

  return isLoading ? (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" className="m-4" />
      </div>
    ) : isError ? (
      <ErrorMessage error={error} />
    ) : (
    <Table striped bordered>
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
  );
}
