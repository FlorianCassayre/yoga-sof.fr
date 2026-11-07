import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';

export type GridColumns<
  Row extends GridValidRowModel,
  Field extends string = never,
> = (GridColDef<Row> & { field: (keyof Row & string) | Field | 'actions' })[];
