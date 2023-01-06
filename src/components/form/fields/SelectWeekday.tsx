import React from 'react';
import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../../../common/course';
import { SelectElement } from 'react-hook-form-mui';
import { WeekdayNames } from '../../../common/date';

interface SelectWeekdayProps {
  name: string;
  disabled?: boolean;
}

export const SelectWeekday: React.FC<SelectWeekdayProps> = ({ name, disabled }) => {
  return (
    <SelectElement
      name={name}
      options={WeekdayNames.map((weekdayLabel, weekdayIndex) => ({
        id: weekdayIndex,
        label: weekdayLabel,
      }))}
      label="Jour de la semaine"
      disabled={disabled}
      fullWidth
    />
  );
};
