import { GuardedBackofficeContainer } from '../../../../components/layout/admin/GuardedBackofficeContainer';
import React from 'react';
import { CourseModelForm } from '../../../../components/form/forms/CourseModelForm';

export default function CourseModelCreate() {
  return (
    <GuardedBackofficeContainer>
      <CourseModelForm urlCancel="/administration/seances/modeles" />
    </GuardedBackofficeContainer>
  );
}
