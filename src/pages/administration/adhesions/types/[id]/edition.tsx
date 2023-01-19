import React from 'react';
import { useRouter } from 'next/router';
import { MembershipModelUpdateForm } from '../../../../../components/form/forms/membershipModel';

export default function MembershipModelUpdate() {
  const router = useRouter();

  return (
    <MembershipModelUpdateForm queryData={router.query} />
  );
}
