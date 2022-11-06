import React from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { Edit, Person } from '@mui/icons-material';
import { User } from '@prisma/client';
import { displayUserName } from '../../../../lib/common/newDisplay';
import { userFindTransformSchema } from '../../../../lib/common/newSchemas/user';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import { useRouter } from 'next/router';

interface AdminUserContentProps {
  user: User;
}

const AdminUserContent: React.FunctionComponent<AdminUserContentProps> = ({ user }: AdminUserContentProps) => {
  return (
    <BackofficeContent
      title={`Utilisateur ${displayUserName(user)}`}
      icon={<Person />}
      actions={[
        { name: 'Modifier', icon: <Edit />, url: `/administration/utilisateurs/${user.id}/edition` }
      ]}
    >
      {JSON.stringify(user)}
    </BackofficeContent>
  );
};

export default function AdminUser() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(['user.find', { id }], userFindTransformSchema);

  return result && result.data ? (
    <AdminUserContent user={result.data} />
  ) : null;
}
