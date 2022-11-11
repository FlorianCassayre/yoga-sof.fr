import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../lib/common/trpc';
import { CourseModel } from '@prisma/client';
import { displayCourseModelName } from '../../../lib/common/newDisplay';

interface SelectCourseModelProps {
  name: string;
  multiple?: boolean;
}

export const SelectCourseModel: React.FC<SelectCourseModelProps> = ({ name, multiple }) => {
  const { data, isLoading } = trpc.useQuery(['courseModel.findAll']);
  return (
    <AutocompleteElement
      name={name}
      options={data ?? []}
      multiple={multiple}
      label="Modèle de séance"
      autocompleteProps={{
        disabled: isLoading,
        getOptionLabel: (option: CourseModel) => displayCourseModelName(option)
      }}
    />
  );
};
