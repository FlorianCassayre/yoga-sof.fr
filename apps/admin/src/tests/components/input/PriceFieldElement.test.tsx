import { fireEvent, render, screen } from '@testing-library/react';
import { FormContainer } from 'react-hook-form-mui';
import { describe, expect, it } from 'vitest';

import { PriceFieldElement } from '../../../components/input/PriceFieldElement';

interface TestValues {
  price: string;
}

const renderField = () =>
  render(
    <FormContainer<TestValues> defaultValues={{ price: '20.5' }}>
      <PriceFieldElement<TestValues> name="price" label="Prix (€)" />
    </FormContainer>,
  );

describe('PriceFieldElement', () => {
  it('renders a number input with decimal step', () => {
    renderField();

    const input = screen.getByLabelText('Prix (€)');
    expect(input.getAttribute('type')).toBe('number');
    expect(input.getAttribute('step')).toBe('0.01');
    expect(input).toHaveProperty('value', '20.5');
  });

  it('updates the form value', () => {
    renderField();

    fireEvent.change(screen.getByLabelText('Prix (€)'), { target: { value: '35.9' } });

    expect(screen.getByLabelText('Prix (€)')).toHaveProperty('value', '35.9');
  });
});
