import React from 'react';
import { CouponModelUpdateForm } from '../../../../../components/form/forms/couponModel';
import { useRouter } from 'next/router';

export default function CouponModelUpdate() {
  const router = useRouter();

  return (
    <CouponModelUpdateForm queryData={router.query} />
  );
}
