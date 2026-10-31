import type { skipToken } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormContainer } from 'react-hook-form-mui';
import { describe, expect, it } from 'vitest';

import { AsyncAutocompleteElement } from '../../../components/input/AsyncAutocompleteElement';

interface Model {
  id: number;
  label: string;
}

interface TestValues {
  courses: Model[];
}

const OPTIONS = (): Model[] => [
  { id: 1, label: 'Séance yoga adultes du jeudi 12 novembre 2026 de 10h45 à 12h00' },
  { id: 2, label: 'Séance yoga enfants du lundi 15 juin 2026 de 09h30 à 10h30' },
];

const renderAutocomplete = ({ preload = false }: { preload?: boolean } = {}) => {
  const list = {
    useQuery: (input: { search?: string } | typeof skipToken) => {
      if (typeof input !== 'object' || input.search === undefined) {
        return { data: { rows: OPTIONS(), total: OPTIONS().length }, isFetching: false };
      }
      const rows = OPTIONS().filter((option) => option.label.includes(input.search!));

      return { data: { rows, total: rows.length }, isFetching: false };
    },
  };

  return render(
    <FormContainer<TestValues> defaultValues={{ courses: [] }}>
      <AsyncAutocompleteElement<Model, TestValues, true>
        name="courses"
        label="Séances"
        multiple
        list={list}
        sort={{ field: 'id', sort: 'asc' }}
        getOptionLabel={(option) => option.label}
        preload={preload}
      />
    </FormContainer>,
  );
};

describe('AsyncAutocompleteElement', () => {
  it('lets the user type in the input', () => {
    renderAutocomplete();

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'yoga adultes' } });

    expect((input as HTMLInputElement).value).toBe('yoga adultes');
  });

  it('adds a selected option to the form value and clears the input', () => {
    renderAutocomplete();

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'enfants' } });
    fireEvent.click(screen.getByRole('option', { name: /yoga enfants/ }));

    expect(
      screen.getAllByText('Séance yoga enfants du lundi 15 juin 2026 de 09h30 à 10h30').length,
    ).toBeGreaterThan(0);
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('shows no options once the input is empty, even after unselecting', () => {
    renderAutocomplete();

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'enfants' } });
    fireEvent.click(screen.getByRole('option', { name: /yoga enfants/ }));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(
      screen.getAllByText('Séance yoga enfants du lundi 15 juin 2026 de 09h30 à 10h30').length,
    ).toBeGreaterThan(0);
  });

  it('lists all options upfront with preload', () => {
    renderAutocomplete({ preload: true });

    fireEvent.mouseDown(screen.getByRole('combobox'));

    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('shows no options without typing when preload is off', () => {
    renderAutocomplete();

    fireEvent.mouseDown(screen.getByRole('combobox'));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('Commencez à taper pour rechercher')).toBeTruthy();
  });

  it('clears the input on blur when no option was selected', () => {
    renderAutocomplete();

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'yoga adultes' } });
    fireEvent.blur(input);

    expect((input as HTMLInputElement).value).toBe('');
  });
});
