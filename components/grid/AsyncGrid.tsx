import React, { useState } from 'react';
import { DataGrid, gridClasses, GridColDef, frFR } from '@mui/x-data-grid';
import { inferHandlerInput, ProcedureRecord } from '@trpc/server';
import { TRPCClientErrorLike } from '@trpc/client';
import { UseQueryResult } from 'react-query';
import { AppRouter, inferProcedures, QueryKey } from '../../lib/server/controllers';
import { trpc } from '../../lib/common/trpc';
import { Card, useTheme } from '@mui/material';
import { GridRowIdGetter } from '@mui/x-data-grid/models/gridRows';

interface AsyncGridProps<TQueryPath extends keyof AppRouter["_def"]["queries"] & string> {
  columns: GridColDef[];
  query: [path: TQueryPath, ...args: inferHandlerInput<AppRouter["_def"]["queries"][TQueryPath]>];
  getRowId?: GridRowIdGetter;
}

const rowsPerPageOptions = [10];

export const AsyncGrid = <TQueryPath extends keyof AppRouter["_def"]["queries"] & string>({ columns, query, getRowId }: AsyncGridProps<TQueryPath>): JSX.Element => {
  const theme = useTheme();
  const { data, isLoading, isError } = trpc.useQuery(query);

  return (
    <Card elevation={0} sx={{ width: '100%' }}>
      <DataGrid
        rows={(data as any[]) ?? []}
        columns={columns}
        getRowId={getRowId}
        autoHeight
        pageSize={rowsPerPageOptions[0]}
        rowsPerPageOptions={rowsPerPageOptions}
        loading={isLoading}
        disableColumnMenu
        disableColumnSelector
        disableSelectionOnClick
        sx={{ // Disable the annoying focus outline
          [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
            outline: "none"
          },
          [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
            outline: "none"
          }
        }}
      />
    </Card>
  );
};
