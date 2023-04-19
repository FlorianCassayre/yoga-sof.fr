import React from 'react';
import { useRouter } from 'next/router';
import { OrderUpdateForm } from '../../../../../components/form/forms/order';

export default function OrderUpdate() {
  const router = useRouter();

  return (
    <OrderUpdateForm queryData={router.query} />
  );
}
