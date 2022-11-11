import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../lib/common/trpc';
import { Course } from '@prisma/client';
import { displayCourseName } from '../../../lib/common/newDisplay';

interface SelectCourseProps {
  name: string;
  multiple?: boolean;
}

export const SelectCourse: React.FC<SelectCourseProps> = ({ name, multiple }) => {
  const { data, isLoading } = trpc.useQuery(['course.findAll', { future: true }]);
  return (
    <AutocompleteElement
      name={name}
      options={data ?? []}
      multiple={multiple}
      label={`Séance${multiple ? 's' : ''}`}
      autocompleteProps={{
        disabled: isLoading,
        getOptionLabel: (option: Course) => displayCourseName(option)
      }}
    />
  );
};
