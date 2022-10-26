import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { inferHandlerInput, ProcedureRecord } from '@trpc/server';
import { TRPCClientErrorLike } from '@trpc/client';
import { UseQueryResult } from 'react-query';
import { createReactQueryHooks, UseTRPCQueryOptions } from '@trpc/react/dist/declarations/src/createReactQueryHooks';
import { AppRouter } from '../../lib/server/controllers';
import { trpc } from '../../lib/common/trpc';
import type { inferProcedureOutput, inferProcedureInput } from '@trpc/server'
import { Paginated, Pagination } from '../../lib/server/services/helpers/types';
import { Box, Button } from '@mui/material';

export interface QueryParameters {
  pagination: Pagination;
}

type inferProcedures<TObj extends ProcedureRecord<any, any, any, any, any, any>> = {
  [TPath in keyof TObj]: {
    input: inferProcedureInput<TObj[TPath]>;
    output: inferProcedureOutput<TObj[TPath]>;
  };
};

interface AsyncGridProps<T> {
  columns: GridColDef[],
  useQuery: (parameters: QueryParameters) => UseQueryResult<Paginated<T>, TRPCClientErrorLike<AppRouter>>;
}

export const AsyncGrid = <T,>({ columns, useQuery }: AsyncGridProps<T>): JSX.Element => {
  const [state, setState] = useState({ page: 0, elementsPerPage: 3 });

  const { data, isLoading, isError } = useQuery({ pagination: { page: state.page, elementsPerPage: state.elementsPerPage } });

  const onFilterChange = () => {};

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={data?.data ?? []}
        columns={columns}
        //paginationMode="client"
        sortingMode="server"
        filterMode="server"
        pageSize={state.elementsPerPage}
        rowsPerPageOptions={[state.elementsPerPage]}
        rowCount={data?.totalElements}
        page={state.page}
        loading={isLoading}
        onFilterModelChange={onFilterChange}
        onPageChange={(newPage) => setState({ ...state, page: newPage })}
      />
    </Box>
  );
};
