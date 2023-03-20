import React from 'react';
import { useRouter } from 'next/router';
import { TransactionUpdateForm } from '../../../../components/form/forms/transaction';

export default function TransactionUpdate() {
  const router = useRouter();

  return (
    <TransactionUpdateForm queryData={router.query} />
  );
}
