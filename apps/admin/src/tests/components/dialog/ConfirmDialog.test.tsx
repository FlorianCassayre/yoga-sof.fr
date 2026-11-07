import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from '../../../components/dialog/ConfirmDialog';
import { renderWithProviders } from '../../helpers';

vi.mock('notistack', () => ({ useSnackbar: () => ({ enqueueSnackbar: vi.fn() }) }));

interface TestRow {
  id: number;
}

const title = 'Supprimer le tarif';

const renderDialog = (
  mutateAsync: () => Promise<TestRow>,
  isPending: boolean,
  onClose: () => void,
) => {
  renderWithProviders(
    <ConfirmDialog<TestRow, { id: number }>
      procedure={{ useMutation: () => ({ mutateAsync, isPending, error: null }) }}
      input={{ id: 54 }}
      title={title}
      message="Voulez-vous vraiment supprimer le tarif ?"
      confirmLabel="Supprimer"
      successMessage="Tarif supprimé."
      onClose={onClose}
    />,
  );
};

describe('ConfirmDialog', () => {
  it('closes when the user clicks the backdrop while idle', () => {
    const onClose = vi.fn();
    renderDialog(() => Promise.resolve({ id: 54 }), false, onClose);

    fireEvent.click(document.querySelector('.MuiBackdrop-root')!);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('cannot be closed while the mutation is pending', () => {
    const onClose = vi.fn();
    renderDialog(() => new Promise(() => undefined), true, onClose);

    expect(screen.getByRole('button', { name: 'Annuler' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Supprimer' }).hasAttribute('disabled')).toBe(true);

    fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
    fireEvent.keyDown(document.querySelector('.MuiDialog-container')!, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes after a successful confirmation', async () => {
    const onClose = vi.fn();
    renderDialog(() => Promise.resolve({ id: 54 }), false, onClose);

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});
