import { Button, Stack, Typography } from '@mui/material';

const NotFoundPage = () => (
  <Stack spacing={2} sx={{ alignItems: 'center', py: 10 }}>
    <Typography variant="h4">Page introuvable</Typography>
    <Typography>La page demandée n'existe pas ou a été supprimée.</Typography>
    <Button href="/" variant="contained">
      Retour à l'accueil
    </Button>
  </Stack>
);

export default NotFoundPage;
