import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';

type PartialGridEnrichedColDef = Pick<GridEnrichedColDef, 'field'> & Partial<GridEnrichedColDef>

export const userColumn = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  ...params,
  valueFormatter: ({ value }: { value: any }) => JSON.stringify(value),
  width: 10000
});
