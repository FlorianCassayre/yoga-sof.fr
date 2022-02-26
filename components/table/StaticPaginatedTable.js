import React, { useState } from 'react';
import { PaginatedTableLayout } from './PaginatedTableLayout';

export function StaticPaginatedTable({ rows, columns, initialResultsPerPage = 10, initialPage = 1, renderEmpty, ...rest }) {
  const [page, setPage] = useState(initialPage);
  const [resultsPerPage, setResultsPerPage] = useState(initialResultsPerPage);

  return (
    <PaginatedTableLayout
      resultsPerPage={resultsPerPage}
      onResultsPerPageChange={setResultsPerPage}
      onPageChange={setPage}
      rows={rows.slice((page - 1) * resultsPerPage, page * resultsPerPage)}
      totalRows={rows.length}
      page={page}
      pageCount={Math.ceil(rows.length / resultsPerPage)}
      columns={columns}
      renderEmpty={renderEmpty}
      {...rest}
    />
  );
}
