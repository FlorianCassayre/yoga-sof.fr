import React from 'react';
import { useRouter } from 'next/router';
import { OtherPaymentCategoryUpdateForm } from '../../../../../components/form/forms/otherPaymentCategory';

export default function OtherPaymentCategoryEdit() {
  const router = useRouter();
  return (
    <OtherPaymentCategoryUpdateForm queryParams={router.query} />
  );
}
