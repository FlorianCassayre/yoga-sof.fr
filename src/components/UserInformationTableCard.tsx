import React from 'react';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import { Close, Done, Info, QuestionMark, ShieldOutlined } from '@mui/icons-material';
import { formatDateDDsMMsYYYY, formatDateDDsMMsYYYYsHHhMMmSSs, formatTimestampRelative } from '../common/date';
import { AuthProviders } from '../common/providers';
import { grey } from '@mui/material/colors';
import { UserLink } from './link/UserLink';
import { InformationTableCard } from './InformationTableCard';
import { getUserLatestMembership } from '../common/user';
import { Prisma, UserRole } from '@prisma/client';
import { ChipLink } from './ChipLink';
import { RoleNames } from '../common/role';

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

interface UserInformationTableCardProps {
  user: Prisma.UserGetPayload<{ include: { courseRegistrations: { include: { course: true } }, accounts: true, managedByUser: true, managedUsers: true, transactions: true, memberships: true, orders: { select: { trialCourseRegistrations: { select: { courseRegistration: { select: { courseId: true } } } } } } } }>;
}

export const UserInformationTableCard: React.FC<UserInformationTableCardProps> = ({ user }) => {
  const displayDate = (date: Date | string | undefined | null) => !!date && `${formatDateDDsMMsYYYYsHHhMMmSSs(date)} (${formatTimestampRelative(date).toLowerCase()})`;
  const membership = getUserLatestMembership(user);
  const trialCourseId: number | undefined = user.orders.flatMap(o => o.trialCourseRegistrations.map(({ courseRegistration: { courseId } }) => courseId))[0];
  return (
    <InformationTableCard
      rows={[
        ...(user.role !== UserRole.MEMBER ? [{
          header: 'Rôle',
          value: <Chip label={RoleNames[user.role]} color="warning" variant="outlined" icon={<ShieldOutlined />} size="small" />,
        }] : []),
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
        {
          header: `Séance d'essai`,
          value: trialCourseId !== undefined ? (
            <ChipLink label="Utilisée" color="success" variant="outlined" icon={<Done />} size="small" href={{ pathname: '/administration/seances/planning/[id]', query: { id: trialCourseId } }} />
          ) : (
            <Chip label="Non utilisée" color="default" variant="outlined" icon={<Close />} size="small" />
          ),
        },
      ]}
    />
  );
};
