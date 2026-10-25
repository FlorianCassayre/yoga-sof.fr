'use client';

import { Button, Container, Paper, Stack, Typography } from '@mui/material';

import { signInWithGoogle } from './signInWithGoogle';

interface AuthPageProps {
  r?: string;
}

export const AuthPage = ({ r }: AuthPageProps) => {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 14 } }}>
      <Stack spacing={3} component={Paper} elevation={0} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Connexion
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Connectez-vous pour accéder à votre espace personnel.
        </Typography>
        <form action={() => signInWithGoogle(r)}>
          <Button fullWidth type="submit" variant="contained">
            Se connecter avec Google
          </Button>
        </form>
      </Stack>
    </Container>
  );
};
