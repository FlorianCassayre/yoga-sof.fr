import { getProviders } from 'next-auth/react';
import { Container } from 'react-bootstrap';
import Link from 'next/link';
import { LoginCard } from '../components';
import { HeadMeta } from '../components/layout/HeadMeta';

export default function Connexion({ providers }) {
  return (
    <div>
      <HeadMeta title="Connexion - Yoga Sof" />

      <Container className="my-5 px-3">
        <LoginCard providers={providers} />
        <div className="text-center mt-3">
          <Link href="/">
            Retourner à l'accueil
          </Link>
        </div>
      </Container>
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return { props: { providers } };
}
