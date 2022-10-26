import React from 'react';
import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../../../lib/common/newCourse';
import { SelectElement } from 'react-hook-form-mui';
import { WeekdayNames } from '../../../lib/common/newDate';

interface SelectWeekdayProps {
  name: string;
}

export const SelectWeekday: React.FC<SelectWeekdayProps> = ({ name }) => {
  return (
    <SelectElement
      name={name}
      options={WeekdayNames.map((weekdayLabel, weekdayIndex) => ({
        id: weekdayIndex,
        label: weekdayLabel,
      }))}
      label="Jour de la semaine"
      fullWidth
    />
  );
};
