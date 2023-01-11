import React from 'react';
import { trpc } from '../../../common/trpc';
import { displayCourseModelName } from '../../../common/display';
import { AsyncSelect } from './AsyncSelect';

interface SelectCourseModelProps {
  name: string;
  multiple?: boolean;
  disabled?: boolean;
}

export const SelectCourseModel: React.FC<SelectCourseModelProps> = ({ name, multiple, disabled }) => {
  return (
    <AsyncSelect
      name={name}
      multiple={multiple}
      disabled={disabled}
      label={`Modèle${multiple ? 's' : ''} de séance${multiple ? 's' : ''}`}
      renderOptionLabel={displayCourseModelName}
      procedure={trpc.courseModel.findAll}
      input={undefined}
    />
  );
};
