import { getProviders } from 'next-auth/react';
import Head from 'next/head';
import { Container } from 'react-bootstrap';
import { LoginCard } from '../components';

export default function Connexion({ providers }) {

  return (
    <div>
      <Head>
        <title>Connexion</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
  }
}
