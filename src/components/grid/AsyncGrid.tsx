import React, { useState } from 'react';
import { DataGrid, gridClasses, GridColDef } from '@mui/x-data-grid';
import { Accordion, AccordionDetails, AccordionSummary, Card } from '@mui/material';
import { GridRowIdGetter, GridValidRowModel } from '@mui/x-data-grid/models/gridRows';
import { inferProcedureInput } from '@trpc/server/dist/core/types';
import { DecorateProcedure } from '@trpc/react-query/shared';
import { ExpandMore } from '@mui/icons-material';
import { ProcedureQueryArray } from '../../server/controllers/types';

interface AsyncGridProps<RowModel extends GridValidRowModel, TProcedure extends ProcedureQueryArray<RowModel, unknown>> {
  columns: GridColDef<RowModel>[];
  procedure: DecorateProcedure<TProcedure, any, any>;
  input: inferProcedureInput<TProcedure>,
  getRowId?: GridRowIdGetter<RowModel>;
  initialSort: { field: string, sort: 'asc' | 'desc' };
  collapsible?: boolean;
  collapsedSummary?: React.ReactNode;
}

const rowsPerPageOptions = [10];

export const AsyncGrid = <RowModel extends GridValidRowModel, TProcedure extends ProcedureQueryArray<RowModel, unknown>>({ columns, procedure, input, getRowId, initialSort, collapsible, collapsedSummary }: AsyncGridProps<RowModel, TProcedure>): JSX.Element => {
  //const theme = useTheme();
  const [enabled, setEnabled] = useState(!collapsible);
  const { data, isLoading, isError } = procedure.useQuery(input, { enabled });

  const [expanded, setExpanded] = useState(false);

  const handleToggleAccordion = () => {
    setEnabled(true);
    setExpanded(!expanded);
  };

  const renderDataGrid = () => (
    <DataGrid
      rows={(data as RowModel[] | undefined) ?? []}
      columns={columns}
      getRowId={getRowId}
      autoHeight
      initialState={{
        sorting: { sortModel: [initialSort] },
        pagination: { paginationModel: { pageSize: rowsPerPageOptions[0] } },
      }}
      pageSizeOptions={rowsPerPageOptions}
      loading={isLoading}
      sortingOrder={['asc', 'desc']}
      disableColumnMenu
      disableColumnSelector
      disableRowSelectionOnClick
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
        // Accordion-only
        ...(collapsible ? {
          // Fit the accordion
          m: -0.1,
          mt: 0,
          // No rounded border with accordion
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        } : {}),
      }}
    />
  );

  return collapsible ? (
    <Accordion
      expanded={expanded}
      onChange={handleToggleAccordion}
      disableGutters
      elevation={0}
      variant="outlined"
      sx={{
        width: '100%',
        '&:before': { // Remove the black line above the accordion (?)
          display: 'none',
        },
        borderRadius: 1,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        {collapsedSummary}
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {renderDataGrid()}
      </AccordionDetails>
    </Accordion>
  ) : (
    <Card elevation={0} sx={{ width: '100%' }}>
      {renderDataGrid()}
    </Card>
  );
};
