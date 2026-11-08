'use client';

import { Alert, Box, Card, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { EMAIL_TYPE_LABELS } from '@yoga-sof/core';
import { Download, Paperclip, Send } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useSnackbar } from 'notistack';

import { BASE_PATH } from '../../basePath';
import { RecordDetails } from '../../components/detail/RecordDetails';
import { RecordTimestamp } from '../../components/detail/RecordTimestamp';
import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { PersonLink } from '../user/PersonLink';
import { EmailIcon } from './EmailIcon';
import { sanitizeMessage } from './sanitizeMessage';

interface EmailPageProps {
  id: number;
}

export const EmailPage = ({ id }: EmailPageProps) => {
  const email = api.email.get.useQuery({ id });
  const attachments = api.email.attachments.useQuery({ id });
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const resend = api.email.resend.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      enqueueSnackbar("L'e-mail a été renvoyé.", { variant: 'success' });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(error instanceof Error ? error.message : 'Une erreur est survenue.', {
        variant: 'error',
      });
    },
  });

  if (email.isPending) {
    return null;
  }

  if (isNotFoundError(email.error)) {
    notFound();
  }

  if (!email.data) {
    return null;
  }

  const row = email.data;

  return (
    <PageLayout icon={EmailIcon} title="E-mail">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {row.sentAt === null && row.sendError !== null && (
          <Alert
            severity="warning"
            action={
              <Tooltip title="Renvoyer l'e-mail">
                <IconButton
                  size="small"
                  disabled={resend.isPending}
                  onClick={() => resend.mutate({ id: row.id })}
                >
                  <Send size={18} />
                </IconButton>
              </Tooltip>
            }
          >
            Cet e-mail n'a pas été envoyé.
          </Alert>
        )}
        <RecordDetails
          entries={[
            { label: 'Type', value: EMAIL_TYPE_LABELS[row.type] },
            { label: 'Destinataire', value: <PersonLink person={row} /> },
            { label: 'Adresse', value: row.destinationAddress },
            { label: 'Cc', value: row.ccAddress ?? '-' },
            { label: 'Créé le', value: <RecordTimestamp date={row.createdAt} /> },
            {
              label: 'Envoyé le',
              value: row.sentAt ? <RecordTimestamp date={row.sentAt} /> : 'En attente',
            },
          ]}
        />
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Card variant="outlined" sx={{ padding: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {row.subject}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Box
              data-email-message
              dangerouslySetInnerHTML={{ __html: sanitizeMessage(row.message) }}
            />
            {attachments.data !== undefined && attachments.data.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.5}>
                  {attachments.data.map((attachment) => (
                    <Stack
                      key={attachment.id}
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center' }}
                    >
                      <Paperclip size={16} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {attachment.filename}
                      </Typography>
                      <Tooltip title="Télécharger">
                        <IconButton
                          size="small"
                          component="a"
                          href={`${BASE_PATH}/emails/${id}/attachments/${attachment.id}`}
                          download
                        >
                          <Download size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
          </Card>
        </Box>
      </Box>
    </PageLayout>
  );
};
