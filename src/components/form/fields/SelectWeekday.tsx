import React from 'react';
import { WeekdayNames } from '../../../common/date';
import { SelectEnum } from './SelectEnum';

interface SelectWeekdayProps {
  name: string;
  disabled?: boolean;
}

export const SelectWeekday: React.FC<SelectWeekdayProps> = ({ name, disabled }) => {
  return (
    <SelectEnum
      name={name}
      values={WeekdayNames.map((_, weekdayIndex) => weekdayIndex)}
      labels={WeekdayNames}
      label="Jour de la semaine"
      disabled={disabled}
    />
  );
};
