import React, { Fragment } from 'react';
import { ButtonGroup, ButtonToolbar, Dropdown, Spinner, Table } from 'react-bootstrap';
import { BsCheckSquare, BsFunnelFill, BsSquare } from 'react-icons/bs';
import { ErrorMessage } from '../ErrorMessage';
import { SimplePagination } from '../SimplePagination';

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
      <ButtonToolbar className="mb-2 justify-content-end">
        <ButtonGroup>
          <Dropdown autoClose="outside">
            <Dropdown.Toggle variant="secondary">
              <BsFunnelFill className="icon me-2" />
              Filtres
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {filters.map(({ title, children }, i) => (
                <Fragment key={i}>
                  {title && (
                    <Dropdown.Header>{title}</Dropdown.Header>
                  )}
                  {children.map(({ name, display }) => {
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
                </Fragment>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </ButtonGroup>
      </ButtonToolbar>
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

      <SimplePagination
        page={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
        isDisabled={isDisabled}
        isLoading={isLoading}
        collapsePagination={collapsePagination}
      />
    </>
  ) : (
    <div className="text-center fst-italic my-4">{renderEmpty()}</div>
  );
}
