import { OtherPaymentUpdateForm } from '../../../../components/form/forms/otherPayment';
import React from 'react';
import { useRouter } from 'next/router';

export default function OtherPaymentEdit() {
  const router = useRouter();
  return (
    <OtherPaymentUpdateForm queryParams={router.query} />
  );
}
