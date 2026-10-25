import { fireEvent, render, screen } from '@testing-library/react';
import {
  COURSE_VISIBILITY_LABELS,
  type CourseVisibility,
  courseVisibilityEnum,
} from '@yoga-sof/core';
import { FormContainer } from 'react-hook-form-mui';
import { describe, expect, it } from 'vitest';

import { EnumSelectElement } from '../../../components/input/EnumSelectElement';
import { COURSE_VISIBILITY_ICONS } from '../../../features/course/visibility/courseVisibilityIcons';

interface TestValues {
  visibility: CourseVisibility;
}

const renderSelect = (withIcons = false) =>
  render(
    <FormContainer<TestValues> defaultValues={{ visibility: 'public' }}>
      <EnumSelectElement<TestValues>
        name="visibility"
        label="Visibilité"
        values={courseVisibilityEnum.enumValues}
        labels={COURSE_VISIBILITY_LABELS}
        icons={withIcons ? COURSE_VISIBILITY_ICONS : undefined}
      />
    </FormContainer>,
  );

describe('EnumSelectElement', () => {
  it('shows the selected label', () => {
    renderSelect();

    expect(screen.getByText('Publique')).toBeTruthy();
  });

  it('lists all values with icons', () => {
    renderSelect(true);

    fireEvent.mouseDown(screen.getByRole('combobox'));

    const listbox = screen.getByRole('listbox');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Publique',
      'Privée',
    ]);
    expect(listbox.querySelectorAll('svg').length).toBe(2);
  });
});
