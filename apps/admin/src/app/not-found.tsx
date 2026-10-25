'use client';

import { Button, Typography } from '@mui/material';
import { FileQuestion } from 'lucide-react';

import { PageLayout } from '../components/page/PageLayout';

const NotFoundPage = () => (
  <PageLayout icon={FileQuestion} title="Page introuvable">
    <Typography>La page demandée n'existe pas ou a été supprimée.</Typography>
    <Button href="/" variant="contained" sx={{ alignSelf: 'flex-start' }}>
      Retour à l'accueil
    </Button>
  </PageLayout>
);

export default NotFoundPage;
