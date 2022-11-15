import React from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Settings } from '@mui/icons-material';
import { CalendarLinkButton } from '../../components/CalendarLinkButton';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { Typography } from '@mui/material';

export default function AdminAdmins() {
  const { data: session } = useSession();

  return (
    <BackofficeContent
      title="Paramètres"
      icon={<Settings />}
    >
      <Typography paragraph>
        Vous pouvez intégrer votre calendrier d'enseignant au moyen du lien ci-dessous, veillez à ne pas le partager avec d'autres personnes :
      </Typography>
      <CalendarLinkButton session={session as Session} coach />
    </BackofficeContent>
  );
}
