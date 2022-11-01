import React from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Email } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { EmailMessageGrid } from '../../components/grid/grids/EmailMessageGrid';

export default function AdminEmails() {
  return (
    <BackofficeContent
      title="Emails"
      icon={<Email />}
    >
      <Typography paragraph>
        Liste des e-mails envoyés par le système. Ce module est en lecture seule.
      </Typography>
      <EmailMessageGrid />
    </BackofficeContent>
  );
}
