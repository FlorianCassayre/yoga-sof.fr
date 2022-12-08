import React from 'react';
import { AutocompleteElement } from 'react-hook-form-mui';
import { trpc } from '../../../common/trpc';
import { CourseModel } from '@prisma/client';
import { displayCourseModelName } from '../../../common/display';
import { Box } from '@mui/material';

interface SelectCourseModelProps {
  name: string;
  multiple?: boolean;
  disabled?: boolean;
}

export const SelectCourseModel: React.FC<SelectCourseModelProps> = ({ name, multiple, disabled }) => {
  const { data, isLoading } = trpc.courseModelFindAll.useQuery();
  return (
    <AutocompleteElement
      name={name}
      options={data ?? []}
      multiple={multiple}
      label="Modèle de séance"
      loading={isLoading}
      autocompleteProps={{
        disabled: isLoading || disabled,
        getOptionLabel: (option: CourseModel) => displayCourseModelName(option),
        renderOption: (props, option) => ( // Weirdly enough, we need to override this ('supposedly' there is a problem of duplicate keys/labels)
          <Box {...props as any} key={option.id}>
            {displayCourseModelName(option)}
          </Box>
        ),
      }}
    />
  );
};
