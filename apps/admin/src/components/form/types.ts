import type { ComponentType } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { z } from 'zod';

import type { AppRoute } from '../../routes';

export interface IdVersion {
  id: number;
  version: number;
}

export interface FieldProps {
  disabled: boolean;
}

export interface GetProcedure<Row> {
  useQuery(input: { id: number }): {
    data: Row | null | undefined;
    error: unknown;
    isPending: boolean;
  };
}

export interface MutationProcedure<Row, Input> {
  useMutation(): {
    mutateAsync(input: Input): Promise<Row>;
    isPending: boolean;
    error: { message: string } | null;
  };
}

export interface FormProps<Row, Values extends FieldValues, Schema extends z.ZodType = z.ZodType> {
  id?: number;
  get?: GetProcedure<Row>;
  create?: MutationProcedure<Row, Values>;
  update?: MutationProcedure<Row, Values & IdVersion>;
  // The mirror validates the FORM VALUES on submit, so the schema must accept
  // them: a server edit schema (which also requires id/version, injected only
  // after validation) is rejected at compile time.
  schema?: Values extends z.input<Schema> ? Schema : never;
  defaultValues: (row: Row | undefined) => Values;
  redirectTo: (row: Row) => AppRoute;
  createdMessage: string;
  updatedMessage?: string;
  submitLabel?: string;
  cancelHref: AppRoute;
  children: ComponentType<FieldProps>;
}
