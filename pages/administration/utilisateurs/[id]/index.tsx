import React from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { Assignment, Block, Edit, Person } from '@mui/icons-material';
import { User } from '@prisma/client';
import { displayUserName } from '../../../../lib/common/newDisplay';
import { userFindTransformSchema } from '../../../../lib/common/newSchemas/user';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import { useRouter } from 'next/router';
import { CourseRegistrationEventGrid } from '../../../../components/grid/grids/CourseRegistrationEventGrid';
import { CourseRegistrationGrid } from '../../../../components/grid/grids/CourseRegistrationGrid';
import { Chip, Stack, Typography } from '@mui/material';

interface AdminUserContentProps {
  user: User;
}

const AdminUserContent: React.FunctionComponent<AdminUserContentProps> = ({ user }: AdminUserContentProps) => {
  return (
    <BackofficeContent
      title={
        <Stack direction="row" gap={2}>
          <span>
            Utilisateur
            {' '}
            {displayUserName(user)}
          </span>
          {user.disabled && (
            <Chip label="Désactivé" color="error" variant="outlined" />
          )}
        </Stack>
      }
      icon={<Person />}
      actions={[
        { name: 'Modifier', icon: <Edit />, url: `/administration/utilisateurs/${user.id}/edition` },
        { name: 'Inscrire à des séances', icon: <Assignment />, url: { pathname: `/administration/inscriptions/creation`, query: { userId: user.id } } },
        { name: 'Désactiver le compte', icon: <Block /> },
      ]}
    >
      <div>
        {JSON.stringify(user)}
      </div>
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Inscriptions de cet utilisateur
      </Typography>
      <CourseRegistrationGrid userId={user.id} />
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Historique d'inscriptions de cet utilisateur
      </Typography>
      <CourseRegistrationEventGrid userId={user.id} />
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
