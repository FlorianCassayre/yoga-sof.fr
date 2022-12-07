import React from 'react';
import { UserUpdateForm } from '../../../../components/form/forms/user';
import { useRouter } from 'next/router';

export default function UserCreate() {
  const router = useRouter();

  return (
    <UserUpdateForm queryParams={router.query} />
  );
}
