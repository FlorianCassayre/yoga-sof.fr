import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../common/trpc';
import { Course, CourseRegistration } from '@prisma/client';
import { displayCourseName } from '../../../common/display';

interface SelectCourseRegistrationProps {
  name: string;
  userId: number;
  noOrder?: boolean;
  notCanceled?: boolean;
  label?: string;
  multiple?: boolean;
  noMatchId?: boolean;
}

export const SelectCourseRegistration: React.FC<SelectCourseRegistrationProps> = ({ name, userId, noOrder, notCanceled, label, multiple, noMatchId }) => {
  const { data, isLoading } = trpc.courseRegistration.findAllActive.useQuery({ userId, isCanceled: !!notCanceled, noOrder });
  return (
    <AutocompleteElement
      name={name}
      options={data ? [...data].sort((a, b) => a.course.dateStart.getTime() - b.course.dateStart.getTime()) : []}
      multiple={multiple}
      matchId={!noMatchId}
      label={label ?? `Séance${multiple ? 's' : ''}`}
      loading={isLoading}
      autocompleteProps={{
        disabled: isLoading,
        getOptionLabel: (option: (CourseRegistration & { course: Course }) | undefined) => option ? displayCourseName(option.course) : '...',
        renderOption: (props, option: (CourseRegistration & { course: Course }) | undefined) => option ? (
          <li {...props} key={option.id}>
            {displayCourseName(option.course)}
          </li>
        ) : '...',
      }}
    />
  );
};
