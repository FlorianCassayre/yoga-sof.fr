import React from 'react';
import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../../../common/course';
import { SelectElement } from 'react-hook-form-mui';
import { SelectEnum } from './SelectEnum';

interface SelectCourseTypeProps {
  name: string;
  disabled?: boolean;
}

export const SelectCourseType: React.FC<SelectCourseTypeProps> = ({ name, disabled }) => {
  return (
    <SelectEnum
      name={name}
      values={Object.keys(CourseType) as CourseType[]}
      labels={CourseTypeNames}
      label="Type de séance"
      disabled={disabled}
    />
  );
};
