import React from 'react';
import { Box, Grid, Typography, Link as MuiLink, CardContent, Card } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { HeadMeta } from '../components/layout/HeadMeta';
import Link from 'next/link';

const EmailSentPage: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <HeadMeta title="Connexion à Yoga Sof : e-mail envoyé" />
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={9} md={6} lg={4} xl={3}>
          <Box sx={{ my: 3, mx: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div" textAlign="center" sx={{ mb: 2 }}>
                  E-mail envoyé
                </Typography>
                <Typography paragraph sx={{ mb: 0 }}>
                  Consultez votre boîte de réception, nous vous avons envoyé un lien pour vous connecter au site.
                </Typography>
              </CardContent>
            </Card>
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Link href="/public" passHref>
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

export default EmailSentPage;
