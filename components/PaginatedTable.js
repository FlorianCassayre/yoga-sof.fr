import { useEffect, useState } from 'react';
import { Spinner, Table } from 'react-bootstrap';
import { useDataApi, useNonInitialEffect } from '../hooks';
import { ErrorMessage } from './ErrorMessage';

export function PaginatedTable({ urlFor, initialResultsPerPage = 10, initialPage = 0, rowsFrom, totalFrom, columns, totalCallback }) {
  const [page, setPage] = useState(0);
  const [{ isLoading, isError, data, error }, setUrl] = useDataApi(urlFor(page, initialResultsPerPage));
  const [resultsPerPage, setResultsPerPage] = useState(initialResultsPerPage);

  useNonInitialEffect(() => {
    setUrl(urlFor(page, resultsPerPage));
  }, [setUrl, urlFor, page, resultsPerPage]);

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
