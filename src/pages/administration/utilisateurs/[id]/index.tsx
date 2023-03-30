import React, { useState } from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { Assignment, Block, Info, Edit, Person, Done, Close, QuestionMark, Delete } from '@mui/icons-material';
import { Prisma } from '@prisma/client';
import { displayUserName } from '../../../../common/display';
import { userFindTransformSchema } from '../../../../common/schemas/user';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import { useRouter } from 'next/router';
import { CourseRegistrationEventGrid } from '../../../../components/grid/grids/CourseRegistrationEventGrid';
import { CourseRegistrationGrid } from '../../../../components/grid/grids/CourseRegistrationGrid';
import { Box, Card, CardContent, Chip, Grid, Stack, Tooltip, Typography } from '@mui/material';
import { InformationTableCard } from '../../../../components/InformationTableCard';
import {
  formatDateDDsMMsYYYY,
  formatDateDDsMMsYYYYsHHhMMmSSs,
  formatTimestampRelative
} from '../../../../common/date';
import { getUserLatestMembership, getUserStatistics } from '../../../../common/user';
import { trpc } from '../../../../common/trpc';
import { useSnackbar } from 'notistack';
import { DisableUserDialog } from '../../../../components/DisableUserDialog';
import { RenableUserDialog } from '../../../../components/RenableUserDialog';
import { AuthProviders } from '../../../../common/providers';
import { grey } from '@mui/material/colors';
import { UserLink } from '../../../../components/link/UserLink';
import { BackofficeContentLoading } from '../../../../components/layout/admin/BackofficeContentLoading';
import { TransactionGrid } from '../../../../components/grid/grids/TransactionGrid';
import { DeleteUserDialog } from '../../../../components/DeleteUserDialog';
import { BackofficeContentError } from '../../../../components/layout/admin/BackofficeContentError';
import { CouponGrid } from '../../../../components/grid/grids/CouponGrid';
import { MembershipGrid } from '../../../../components/grid/grids/MembershipGrid';
import { OrderGrid } from '../../../../components/grid/grids/OrderGrid';

interface GridItemStatisticProps {
  value: number;
  valueFormatter?: (value: number) => string;
  title: string;
  label: React.ReactNode;
  good?: boolean;
}

const GridItemStatistic: React.FC<GridItemStatisticProps> = ({ value, valueFormatter, title, label, good }) => (
  <Grid item xs={6} sm={3} textAlign="center">
    <Tooltip title={<Box textAlign="center">{label}</Box>}>
      <Box sx={{ cursor: 'help' }}>
        <Typography variant="h4" component="div" sx={{ mt: 1, mb: 1 }} color={value > 0 ? (good === undefined ? 'black' : good ? 'green' : 'red') : 'text.secondary'}>
          {valueFormatter ? valueFormatter(value) : value}
        </Typography>
        <Typography color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Tooltip>
  </Grid>
);

interface UserProvidedInformationChipProps {
  original: string;
}

const UserProvidedInformationChip: React.FC<UserProvidedInformationChipProps> = ({ original }) => (
  <Tooltip title={(
    <>
      <Box>Cette donnée a été modifiée par l'utilisateur.</Box>
      <Box>
        La valeur originale était{' '}
        {original ? (
          <strong>{original}</strong>
        ) : 'vide.'}
      </Box>
    </>
  )}>
    <Info color="action" />
  </Tooltip>
);

interface AdminUserContentProps {
  user: Prisma.UserGetPayload<{ include: { courseRegistrations: { include: { course: true } }, accounts: true, managedByUser: true, managedUsers: true, transactions: true, memberships: true } }>;
}

const AdminUserContent: React.FunctionComponent<AdminUserContentProps> = ({ user }: AdminUserContentProps) => {
  const title = `Utilisateur ${displayUserName(user)}`;
  const displayDate = (date: Date | string | undefined | null) => !!date && `${formatDateDDsMMsYYYYsHHhMMmSSs(date)} (${formatTimestampRelative(date).toLowerCase()})`;
  const statistics = getUserStatistics(user);
  const membership = getUserLatestMembership(user);
  const trpcClient = trpc.useContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: mutateDisable, isLoading: isDisablingLoading } = trpc.user.disabled.useMutation({
    onSuccess: async (_, { disabled }) => {
      await Promise.all((
        [trpcClient.user.find, trpcClient.user.findAll]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(disabled ? `L'utilisateur a été désactivé` : `L'utilisateur a été réactivé`, { variant: 'success' });
    },
    onError: (_, { disabled }) => {
      enqueueSnackbar(`Une erreur est survenue lors de la ${disabled ? 'désactivation' : 'réactivation'} de l'utilisateur`, { variant: 'error' });
    },
  });
  const [isDisableDialogOpen, setDisableDialogOpen] = useState(false);
  const { mutate: mutateDelete, isLoading: isDeleteLoading } = trpc.user.delete.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.user.find, trpcClient.user.findAll]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`L'utilisateur a été supprimé`, { variant: 'success' });
      return router.push('/administration/utilisateurs');
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la suppression de l'utilisateur ; il est possible que l'utilisateur ne soit pas suppressible`, { variant: 'error' });
    },
  });
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
        { name: user.disabled ? 'Réactiver le compte' : 'Désactiver le compte', icon: <Block />, onClick: () => setDisableDialogOpen(true), disabled: isDisablingLoading },
        { name: 'Supprimer', icon: <Delete />, onClick: () => setDeleteDialogOpen(true), disabled: isDeleteLoading },
      ]}
      quickActions={[
        { name: 'Inscrire à des séances', icon: <Assignment />, url: { pathname: `/administration/inscriptions/creation`, query: { userId: user.id } } },
      ]}
    >
      <DisableUserDialog user={user} open={isDisableDialogOpen && !user.disabled} setOpen={setDisableDialogOpen} onConfirm={() => mutateDisable({ id: user.id, disabled: true })} />
      <RenableUserDialog user={user} open={isDisableDialogOpen && user.disabled} setOpen={setDisableDialogOpen} onConfirm={() => mutateDisable({ id: user.id, disabled: false })} />
      <DeleteUserDialog user={user} open={isDeleteDialogOpen} setOpen={setDeleteDialogOpen} onConfirm={() => mutateDelete({ id: user.id })} />
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
                header: 'Adhérent',
                value: membership ? (
                  <Chip label={`Oui (jusqu'au ${formatDateDDsMMsYYYY(membership.dateEnd)})`} color="success" variant="outlined" icon={<Done />} size="small" />
                ) : (
                  <Chip label="Non" color="default" variant="outlined" icon={<Close />} size="small" />
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
              { header: 'Dernière connexion', value: user.lastActivity !== null ? displayDate(user.lastActivity) : 'Jamais' },
              { header: user.lastActivity ? 'Création du compte' : 'Date de création', value: displayDate(user.createdAt) },
              {
                header: 'Services de connexion',
                value: (() => {
                  const providers = [...(user.emailVerified !== null ? ['email'] : []), ...user.accounts.map(({ provider }) => provider)];
                  return providers.length > 0 ? (
                    <Stack direction="row" spacing={1}>
                      {providers
                        .sort()
                        .map(provider => [provider, AuthProviders[provider] ?? AuthProviders['fallback']] as const)
                        .map(([provider, { name, icon }]) => (
                          <Tooltip key={provider} title={name} sx={{ color: grey[600] }}>
                            {icon}
                          </Tooltip>
                        ))}
                    </Stack>
                  ) : '(aucun)'
                })(),
              },
              ...(user.managedByUser ? [{
                header: 'Supervisé par',
                value: <UserLink user={user.managedByUser} />,
              }] : []),
              ...(user.managedUsers.length > 0 ? [{
                header: 'Supervise',
                value: (
                  <Stack direction="row" spacing={2}>
                    {user.managedUsers.map(managedUser => (
                      <UserLink key={managedUser.id} user={managedUser} />
                    ))}
                  </Stack>
                ),
              }] : []),
            ]}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="h6" component="div">
                Statistiques
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <GridItemStatistic
                  value={statistics.coursesPast}
                  title="Séances passées"
                  label="Nombre total de séances non annulées passées pour lesquelles l'utilisateur était inscrit. Les absences sont comptabilisées. Une séance est considérée comme passée dès lors que la date de fin est atteinte."
                />
                <GridItemStatistic
                  value={statistics.coursesFuture}
                  title="Séances à venir"
                  label="Nombre total de séances non annulées à venir pour lesquelles l'utilisateur est inscrit. Une séance est considérée comme étant à venir tant que la date fin n'a pas été atteinte."
                  good
                />
                <GridItemStatistic
                  value={statistics.courseUnregistrations}
                  title="Séances désinscrites"
                  label="Nombre total de séances pour lesquelles l'utilisateur s'était inscrit au moins une fois, mais s'est finalement désinscrit. Les séances annulées sont exclues."
                  good={false}
                />
                <GridItemStatistic
                  value={statistics.courseAbsences}
                  title="Absences"
                  label="Nombre total d'absences. Une désinscription n'est pas comptabilisée comme une absence. Les séances annulées sont également exclues."
                  good={false}
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Participations
      </Typography>
      <CourseRegistrationGrid userId={user.id} />
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Historique d'inscriptions
      </Typography>
      <CourseRegistrationEventGrid userId={user.id} />
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Absences
      </Typography>
      <CourseRegistrationGrid userId={user.id} attended={false} />
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Comptabilité
      </Typography>
      <Stack direction="column" gap={2}>
        <OrderGrid userId={user.id} />
        <TransactionGrid userId={user.id} />
        <MembershipGrid collapsible collapsedSummary="Adhésions de l'utilisateur" userId={user.id} />
        <CouponGrid collapsible collapsedSummary="Cartes possédées par cet utilisateur" userId={user.id} />
      </Stack>
      </BackofficeContent>
  );
};

export default function AdminUser() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(trpc.user.find, { id }, userFindTransformSchema);

  return result && result.data ? (
    <AdminUserContent user={result.data as any} />
  ) : result?.isLoading ? <BackofficeContentLoading /> : <BackofficeContentError error={result?.error} />;
}
