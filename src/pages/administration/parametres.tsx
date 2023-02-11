import React from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Settings } from '@mui/icons-material';
import { CalendarLinkButton } from '../../components/CalendarLinkButton';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { Stack, Typography } from '@mui/material';
import { UserGrid } from '../../components/grid/grids/UserGrid';
import { EmailMessageGrid } from '../../components/grid/grids/EmailMessageGrid';

export default function AdminAdmins() {
  const { data: session } = useSession();

  return (
    <BackofficeContent
      title="Paramètres"
      icon={<Settings />}
    >
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Calendrier d'enseignant
      </Typography>
      <Typography paragraph>
        Vous pouvez intégrer votre calendrier d'enseignant au moyen du lien ci-dessous, veillez à ne pas le partager avec d'autres personnes :
      </Typography>
      <CalendarLinkButton publicAccessToken={(session as Session).publicAccessToken} coach />
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Autres listes
      </Typography>
      <Stack direction="column" spacing={2}>
        <UserGrid disabledUsers={true} collapsible collapsedSummary="Utilisateurs désactivés" />
        <EmailMessageGrid sent={false} collapsible collapsedSummary="Emails non envoyés" />
      </Stack>
    </BackofficeContent>
  );
}
