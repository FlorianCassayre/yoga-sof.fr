import React from 'react';
import { CourseType, MembershipType } from '@prisma/client';
import { CourseTypeNames } from '../../../common/course';
import { SelectElement } from 'react-hook-form-mui';
import { SelectEnum } from './SelectEnum';
import { MembershipTypeNames } from '../../../common/membership';

interface SelectMembershipTypeProps {
  name: string;
  disabled?: boolean;
}

export const SelectMembershipType: React.FC<SelectMembershipTypeProps> = ({ name, disabled }) => {
  return (
    <SelectEnum
      name={name}
      values={Object.keys(MembershipType) as MembershipType[]}
      labels={MembershipTypeNames}
      label="Type d'adhésion"
      disabled={disabled}
    />
  );
};
