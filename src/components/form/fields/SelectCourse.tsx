import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../common/trpc';
import { Course } from '@prisma/client';
import { displayCourseModelName, displayCourseName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';

interface SelectCourseProps {
  name: string;
  multiple?: boolean;
}

export const SelectCourse: React.FC<SelectCourseProps> = ({ name, multiple }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      label={`Séance${multiple ? 's' : ''}`}
      renderOptionLabel={(course: any) => displayCourseName(course)}
      procedure={trpc.course.findAll}
      input={{ future: true, canceled: false }}
    />
  );
};
