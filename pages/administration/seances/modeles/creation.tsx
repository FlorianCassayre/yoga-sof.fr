import { GuardedBackofficeContainer } from '../../../../components/layout/admin/GuardedBackofficeContainer';
import React from 'react';
import { CourseModelCreateForm } from '../../../../components/form/forms/course';

export default function CourseModelCreate() {
  return (
    <GuardedBackofficeContainer>
      <CourseModelCreateForm />
    </GuardedBackofficeContainer>
  );
}
