import React, { useState } from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { Assignment, Block, Info, Edit, Person, Done, Close, Help, QuestionMark } from '@mui/icons-material';
import { Prisma, User } from '@prisma/client';
import { displayUserName } from '../../../../common/display';
import { userFindTransformSchema } from '../../../../common/schemas/user';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import { useRouter } from 'next/router';
import { CourseRegistrationEventGrid } from '../../../../components/grid/grids/CourseRegistrationEventGrid';
import { CourseRegistrationGrid } from '../../../../components/grid/grids/CourseRegistrationGrid';
import { Box, Card, CardContent, Chip, Grid, Stack, Tooltip, Typography } from '@mui/material';
import { InformationTableCard } from '../../../../components/InformationTableCard';
import {
  formatDateDDsMMsYYYYsHHhMMmSSs,
  formatTimestampRelative
} from '../../../../common/date';
import { getUserStatistics } from '../../../../common/user';
import { trpc } from '../../../../common/trpc';
import { useSnackbar } from 'notistack';
import { DisableUserDialog } from '../../../../components/DisableUserDialog';
import { RenableUserDialog } from '../../../../components/RenableUserDialog';

interface GridItemStatisticProps {
  value: number;
  title: string;
  good?: boolean;
}

const GridItemStatistic: React.FC<GridItemStatisticProps> = ({ value, title, good }) => (
  <Grid item xs={6} sm={3} textAlign="center">
    <Typography variant="h4" component="div" sx={{ mt: 1, mb: 1 }} color={value > 0 ? (good === undefined ? 'black' : good ? 'green' : 'red') : 'text.secondary'}>
      {value}
    </Typography>
    <Typography color="text.secondary">
      {title}
    </Typography>
  </Grid>
);

interface UserProvidedInformationChipProps {
  original: string;
}

const UserProvidedInformationChip: React.FC<UserProvidedInformationChipProps> = ({ original }) => (
  <Tooltip title={(
    <>
      <Box>Cette donnée a été modifiée par l'utilisateur.</Box>
      <Box>La valeur originale était : <strong>{original}</strong></Box>
    </>
  )}>
    <Info color="action" />
  </Tooltip>
);

interface AdminUserContentProps {
  user: Prisma.UserGetPayload<{ include: { courseRegistrations: { include: { course: true } }, accounts: true } }>;
}

const AdminUserContent: React.FunctionComponent<AdminUserContentProps> = ({ user }: AdminUserContentProps) => {
  const title = `Utilisateur ${displayUserName(user)}`;
  const displayDate = (date: Date | string | undefined | null) => !!date && `${formatDateDDsMMsYYYYsHHhMMmSSs(date)} (${formatTimestampRelative(date).toLowerCase()})`;
  const statistics = getUserStatistics(user);
  const trpcClient = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: mutateDisable, isLoading: isDisablingLoading } = trpc.userDisabled.useMutation({
    onSuccess: async (_, { disabled }) => {
      await Promise.all((
        [trpcClient.userFind, trpcClient.userFindAll]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(disabled ? `L'utilisateur a été désactivé` : `L'utilisateur a été réactivé`, { variant: 'success' });
    },
    onError: (_, { disabled }) => {
      enqueueSnackbar(`Une erreur est survenue lors de la ${disabled ? 'désactivation' : 'réactivation'} de l'utilisateur`, { variant: 'error' });
    },
  });
  const [isDisableDialogOpen, setDisableDialogOpen] = useState(false);
  return (
    <BackofficeContent
      titleRaw={title}
      title={
        <Stack direction="row" gap={2}>
          <span>
            {title}
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
        { name: user.disabled ? 'Réactiver le compte' : 'Désactiver le compte', icon: <Block />, onClick: () => setDisableDialogOpen(true), disabled: isDisablingLoading },
      ]}
    >
      <DisableUserDialog user={user} open={isDisableDialogOpen && !user.disabled} setOpen={setDisableDialogOpen} onConfirm={() => mutateDisable({ id: user.id, disabled: true })} />
      <RenableUserDialog user={user} open={isDisableDialogOpen && user.disabled} setOpen={setDisableDialogOpen} onConfirm={() => mutateDisable({ id: user.id, disabled: false })} />
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Informations sur l'utilisateur
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <InformationTableCard
            rows={[
              {
                header: 'Statut',
                value: user.disabled ? (
                  <Chip label="Désactivé" color="error" variant="outlined" icon={<Close />} size="small" />
                ) : user.lastActivity ? (
                  <Chip label="Actif" color="success" variant="outlined" icon={<Done />} size="small" />
                ) : (
                  <Chip label="Jamais connecté" color="default" variant="outlined" icon={<QuestionMark />} size="small" />
                ),
              },
              {
                header: 'Nom',
                value: (
                  <Stack direction="row" alignItems="center" gap={1}>
                    {user.customName ?? user.name}
                    {user.customName !== null && user.customName !== user.name && (
                      <UserProvidedInformationChip original={user.name ?? ''} />
                    )}
                  </Stack>
                ),
              },
              {
                header: 'Adresse e-mail',
                value: (
                  <Stack direction="row" alignItems="center" gap={1}>
                    {user.customEmail ?? user.email}
                    {user.customEmail !== null && user.customEmail !== user.email && (
                      <UserProvidedInformationChip original={user.email ?? ''} />
                    )}
                  </Stack>
                ),
              },
              { header: 'Dernière connexion', value: displayDate(user.lastActivity) },
              { header: 'Première connexion', value: displayDate(user.createdAt) },
              { header: 'Services de connexion', value: user.accounts.length },
            ]}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="h6" component="div">
                Statistiques
              </Typography>
              <Grid container spacing={2}>
                <GridItemStatistic value={statistics.coursesPast} title="Séances passées" />
                <GridItemStatistic value={statistics.coursesFuture} title="Séances à venir" good />
                <GridItemStatistic value={statistics.courseUnregistrations} title="Séances désinscrites" good={false} />
                <GridItemStatistic value={statistics.courseAbsences} title="Absences" good={false} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Inscriptions de cet utilisateur
      </Typography>
      <CourseRegistrationGrid userId={user.id} />
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Historique d'inscriptions de cet utilisateur
      </Typography>
      <CourseRegistrationEventGrid userId={user.id} />
    </BackofficeContent>
  );
};

export default function AdminUser() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(trpc.userFind, { id }, userFindTransformSchema);

  return result && result.data ? (
    <AdminUserContent user={result.data as any} />
  ) : null;
}
