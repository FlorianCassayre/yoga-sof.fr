import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../common/trpc';
import { Course } from '@prisma/client';
import { displayCourseName } from '../../../common/display';

interface SelectCourseProps {
  name: string;
  multiple?: boolean;
}

export const SelectCourse: React.FC<SelectCourseProps> = ({ name, multiple }) => {
  const { data, isLoading } = trpc.useQuery(['course.findAll', { future: true, canceled: false }]);
  return (
    <AutocompleteElement
      name={name}
      options={data ?? []}
      multiple={multiple}
      matchId
      label={`Séance${multiple ? 's' : ''}`}
      loading={isLoading}
      autocompleteProps={{
        disabled: isLoading,
        getOptionLabel: (option: Course | undefined) => option ? displayCourseName(option) : '...',
      }}
    />
  );
};
