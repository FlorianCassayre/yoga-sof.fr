import React from 'react';
import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../../../lib/common/course';
import { SelectElement } from 'react-hook-form-mui';

interface SelectCourseTypeProps {
  name: string;
  disabled?: boolean;
}

export const SelectCourseType: React.FC<SelectCourseTypeProps> = ({ name, disabled }) => {
  return (
    <SelectElement
      name={name}
      options={Object.keys(CourseType).map(key => ({
        id: key,
        label: CourseTypeNames[key as keyof typeof CourseType],
      }))}
      label="Type de séance"
      disabled={disabled}
      fullWidth
    />
  );
};
