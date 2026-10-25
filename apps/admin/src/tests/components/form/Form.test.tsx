import { QueryClient } from '@tanstack/react-query';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { TextFieldElement } from 'react-hook-form-mui';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Form } from '../../../components/form/Form';
import type { FieldProps, IdVersion } from '../../../components/form/types';
import { fakeMutation, fakeQuery, renderWithProviders } from '../../helpers';

interface TestValues {
  internalNotes: string;
}

interface TestRow extends IdVersion {
  internalNotes: string;
}

const row: TestRow = { id: 54, version: 3, internalNotes: 'from db' };

const push = vi.hoisted(() => vi.fn());
const notFound = vi.hoisted(() => vi.fn());
const enqueueSnackbar = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ notFound, useRouter: () => ({ push }) }));
vi.mock('notistack', () => ({ useSnackbar: () => ({ enqueueSnackbar }) }));

const Fields = ({ disabled }: FieldProps) => (
  <TextFieldElement<TestValues> name="internalNotes" label="Notes" disabled={disabled} />
);

interface RenderFormOptions {
  id?: number;
  row?: TestRow | null;
  createResult?: (values: TestValues) => TestRow | Promise<TestRow>;
  updateResult?: (values: TestValues & IdVersion) => TestRow | Promise<TestRow>;
  queryClient?: QueryClient;
}

const renderForm = ({
  id,
  row: currentRow = null,
  createResult = () => ({ ...row, id: 99, version: 1 }),
  updateResult = () => row,
  queryClient = new QueryClient(),
}: RenderFormOptions = {}) => {
  const create = fakeMutation<TestRow, TestValues>(createResult);
  const update = fakeMutation<TestRow, TestValues & IdVersion>(updateResult);

  renderWithProviders(
    <Form<TestRow, TestValues>
      id={id}
      get={fakeQuery<TestRow>(currentRow)}
      create={create}
      update={update}
      defaultValues={(r) => ({ internalNotes: r?.internalNotes ?? 'draft' })}
      redirectTo={(saved) => `/rows/${saved.id}`}
      createdMessage="Créé."
      updatedMessage="Modifié."
      cancelHref="/rows"
    >
      {Fields}
    </Form>,
    queryClient,
  );

  return { create, update, queryClient };
};

beforeEach(() => {
  push.mockClear();
  notFound.mockClear();
  enqueueSnackbar.mockClear();
});

describe('Form', () => {
  it('creates on submit and redirects', async () => {
    const { create, update } = renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() =>
      expect(create.mutateAsync).toHaveBeenCalledWith({ internalNotes: 'draft' }),
    );
    expect(update.mutateAsync).not.toHaveBeenCalled();
    expect(enqueueSnackbar).toHaveBeenCalledWith('Créé.', { variant: 'success' });
    expect(push).toHaveBeenCalledWith('/rows/99');
  });

  it('updates with the current version on submit', async () => {
    const { create, update } = renderForm({ id: row.id, row });

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() =>
      expect(update.mutateAsync).toHaveBeenCalledWith({
        internalNotes: 'from db',
        id: 54,
        version: 3,
      }),
    );
    expect(create.mutateAsync).not.toHaveBeenCalled();
    expect(enqueueSnackbar).toHaveBeenCalledWith('Modifié.', { variant: 'success' });
    expect(push).toHaveBeenCalledWith('/rows/54');
  });

  it('invalidates queries after a successful mutation', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    renderForm({ queryClient });

    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() => expect(invalidate).toHaveBeenCalled());
  });

  it('404s when the row is missing', () => {
    renderForm({ id: 1 });

    expect(notFound).toHaveBeenCalled();
  });

  it('shows an error snackbar on failure and does not redirect', async () => {
    const message = 'La séance a été modifiée entre-temps.';
    renderForm({
      createResult: () => Promise.reject(new Error(message)),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() =>
      expect(enqueueSnackbar).toHaveBeenCalledWith(message, { variant: 'error' }),
    );
    expect(push).not.toHaveBeenCalled();
  });
});
