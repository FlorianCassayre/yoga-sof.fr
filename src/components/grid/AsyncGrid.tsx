import React from 'react';
import { DataGrid, gridClasses, GridColDef } from '@mui/x-data-grid';
import { inferHandlerInput } from '@trpc/server';
import { AppRouter } from '../../server/controllers';
import { trpc } from '../../common/trpc';
import { Card, useTheme } from '@mui/material';
import { GridRowIdGetter, GridValidRowModel } from '@mui/x-data-grid/models/gridRows';
import { Procedure, ProcedureParams } from '@trpc/server/src/core/procedure';
import { AnyRootConfig } from '@trpc/server/src/core/internals/config';
import { inferProcedureInput } from '@trpc/server/dist/core/types';
import { DecorateProcedure } from '@trpc/react-query/shared';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';

type ProcedureQueryArray<T> = Procedure<'query', ProcedureParams<AnyRootConfig, unknown, unknown, unknown, unknown, T[], unknown>>;

interface AsyncGridProps<T, TProcedure extends ProcedureQueryArray<T>> {
  columns: GridColDef[];
  procedure: DecorateProcedure<TProcedure, any, any>;
  input: inferProcedureInput<TProcedure>,
  getRowId?: GridRowIdGetter;
  getRowClassName?: (row: any) => any;
  initialSort: { field: string, sort: 'asc' | 'desc' };
}

const rowsPerPageOptions = [10];

export const AsyncGrid = <RowModel extends GridValidRowModel, Columns extends GridColumns<RowModel>, TProcedure extends ProcedureQueryArray<RowModel>>({ columns, procedure, input, getRowId, getRowClassName, initialSort }: AsyncGridProps<RowModel, TProcedure>): JSX.Element => {
  //const theme = useTheme();
  const { data, isLoading, isError } = procedure.useQuery(input);

  return (
    <Card elevation={0} sx={{ width: '100%' }}>
      <DataGrid
        rows={data ?? []}
        columns={columns}
        getRowId={getRowId}
        autoHeight
        pageSize={rowsPerPageOptions[0]}
        rowsPerPageOptions={rowsPerPageOptions}
        loading={isLoading}
        getRowClassName={getRowClassName}
        sortingOrder={['asc', 'desc']}
        initialState={{ sorting: { sortModel: [initialSort] } }}
        disableColumnMenu
        disableColumnSelector
        disableSelectionOnClick
        sx={{
          // Disable the annoying focus outline
          [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
            outline: "none"
          },
          [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
            outline: "none"
          },
          // Hide the column separators
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
        }}
      />
    </Card>
  );
};
