import React from 'react';
import { LoginCard } from '../components/LoginCard';
import { getProviders } from 'next-auth/react';
import { Box, Grid, Typography, Link as MuiLink } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { HeadMeta } from '../components/layout/HeadMeta';
import Link from 'next/link';

interface ConnexionPageProps {
  providers: Awaited<ReturnType<typeof getProviders>>;
}

const ConnexionPage: React.FC<ConnexionPageProps> = ({ providers }) => {
  if (!providers) {
    return null;
  }
  return (
    <>
      <CssBaseline />
      <HeadMeta title="Connexion à Yoga Sof" />
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={9} md={6} lg={4} xl={3}>
          <Box sx={{ my: 3, mx: 2 }}>
            <LoginCard providers={providers} />
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Link href="/" passHref legacyBehavior>
                <MuiLink>
                  Retourner à l'accueil
                </MuiLink>
              </Link>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export async function getServerSideProps() {
  const providers = await getProviders();
  return { props: { providers } };
}

export default ConnexionPage;
