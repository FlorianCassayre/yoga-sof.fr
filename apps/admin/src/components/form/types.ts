import type { ComponentType } from 'react';
import type { FieldValues } from 'react-hook-form';

export interface IdVersion {
  id: number;
  version: number;
}

export interface FieldProps {
  disabled: boolean;
}

export interface GetProcedure<Row extends IdVersion> {
  useQuery(input: { id: number }): {
    data: Row | null | undefined;
    error: unknown;
    isPending: boolean;
  };
}

export interface MutationProcedure<Row extends IdVersion, Input> {
  useMutation(): {
    mutateAsync(input: Input): Promise<Row>;
    isPending: boolean;
    error: { message: string } | null;
  };
}

export interface FormProps<Row extends IdVersion, Values extends FieldValues> {
  id?: number;
  get: GetProcedure<Row>;
  create: MutationProcedure<Row, Values>;
  update: MutationProcedure<Row, Values & IdVersion>;
  defaultValues: (row: Row | undefined) => Values;
  redirectTo: (row: Row) => string;
  createdMessage: string;
  updatedMessage: string;
  cancelHref: string;
  children: ComponentType<FieldProps>;
}
