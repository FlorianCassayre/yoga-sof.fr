import { Box, Container } from '@mui/material';
import { getProviders } from 'next-auth/react';
import Link from 'next/link';
import { HeadMeta } from '../components/layout/HeadMeta';
import { NewLoginCard } from '../components/NewLoginCard';

export default function Connexion({ providers }) {
  return (
    <>
      <HeadMeta title="Connexion - Yoga Sof" />

      <Container className="my-5 px-3">
        <NewLoginCard providers={providers} />
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link href="/">
            Retourner à l'accueil
          </Link>
        </Box>
      </Container>
    </>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return { props: { providers } };
}
