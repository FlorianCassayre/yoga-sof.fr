import React from 'react';
import { Dropdown, Pagination, Spinner, Table } from 'react-bootstrap';
import { BsCheckSquare, BsFunnelFill, BsSquare } from 'react-icons/bs';
import { ErrorMessage } from '../ErrorMessage';

export function PaginatedTableLayout({
  isLoading,
  isDisabled,
  isError,
  error,
  resultsPerPage = 10, // eslint-disable-line no-unused-vars
  onResultsPerPageChange, // eslint-disable-line no-unused-vars
  onPageChange,
  rows,
  totalRows,
  page,
  pageCount,
  columns,
  collapsePagination = true,
  filters = [],
  filtersValues = {},
  onFilterValueChange,
  renderEmpty,
  rowProps = () => {},
  ...rest
}) {
  const renderFilters = () => {
    if (!filters.length) {
      return null;
    }

    return (
      <div className="mb-2 text-end">
        <Dropdown>
          <Dropdown.Toggle variant="secondary">
            <BsFunnelFill className="icon me-2" />
            Filtres
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {filters.map(({ name, display }) => {
              // TODO this only works for boolean filters, adapt it for more types
              const value = filtersValues[name];
              const Icon = value ? BsCheckSquare : BsSquare;
              return (
                <Dropdown.Item href="#" key={name} onClick={() => onFilterValueChange(name, !value)} disabled={isDisabled || isLoading}>
                  <Icon className="icon me-2" />
                  {display}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  const renderPagination = () => {
    if (pageCount <= 1 && collapsePagination) {
      return null;
    }

    const pageSet = new Set();
    const radiusPage = 2;
    const radiusExtremity = 1;
    for (let i = page - radiusPage + 1; i <= page + radiusPage - 1; i++) {
      pageSet.add(i);
    }
    for (let i = 0; i < radiusExtremity; i++) {
      pageSet.add(1 + i);
      pageSet.add(pageCount - i);
    }

    const visiblePages = Array.from(pageSet)
      .filter(i => i >= 1 && i <= pageCount)
      .sort((a, b) => a - b);

    return (
      <Pagination className="justify-content-center">
        <Pagination.Prev disabled={page === 1 || isDisabled || isLoading} onClick={() => onPageChange(page - 1)} />

        {visiblePages.map((visiblePage, i) => (
          <React.Fragment key={visiblePage}>
            <Pagination.Item active={page === visiblePage} disabled={isDisabled || isLoading} onClick={() => onPageChange(visiblePage)}>
              {visiblePage}
            </Pagination.Item>
            {i < visiblePages.length - 1 && visiblePage + 1 !== visiblePages[i + 1] && <Pagination.Ellipsis disabled />}
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
  ) : totalRows > 0 || !renderEmpty ? (
    <>
      {renderFilters()}

      <Table striped bordered responsive {...rest}>
        <thead>
          <tr className="text-center">
            {columns.map(({ title }, i) => (
              <th key={i}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody className={`align-middle ${isLoading ? 'opacity-50' : ''}`}>
          {rows.map((rowData, i) => (
            <tr key={i} {...rowProps(rowData)}>
              {columns.map(({ render, props }, j) => (
                <td key={j} {...(props ?? {})}>
                  {render(rowData, isDisabled || isLoading)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      {renderPagination()}
    </>
  ) : (
    <div className="text-center fst-italic my-4">{renderEmpty()}</div>
  );
}
