import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormShell } from '../../../components/form/FormShell';

describe('FormShell', () => {
  it('disables both buttons while submitting', () => {
    render(
      <FormShell submitLabel="Créer" submitting cancelHref="/seances">
        <p>fields</p>
      </FormShell>,
    );

    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Créer' }).disabled).toBe(true);
    expect(screen.getByRole('link', { name: 'Annuler' }).className).toContain('Mui-disabled');
  });

  it('enables both buttons when not submitting', () => {
    render(
      <FormShell submitLabel="Créer" cancelHref="/seances">
        <p>fields</p>
      </FormShell>,
    );

    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Créer' }).disabled).toBe(false);
    expect(screen.getByRole('link', { name: 'Annuler' }).className).not.toContain('Mui-disabled');
  });
});
