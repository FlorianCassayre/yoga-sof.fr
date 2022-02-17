import { getProviders } from 'next-auth/react';
import { Container } from 'react-bootstrap';
import { LoginCard } from '../components';
import { HeadMeta } from '../components/layout/HeadMeta';

export default function Connexion({ providers }) {
  return (
    <div>
      <HeadMeta title={`Connexion - Yoga Sof`} />

      <Container className="my-5 px-3">
        <LoginCard providers={providers} />
      </Container>
    </div>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
