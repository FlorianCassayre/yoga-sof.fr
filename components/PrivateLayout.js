import Head from 'next/head';

export function PrivateLayout({ children, pathname }) {

  return (
    <div style={{ height: '100%' }}>
      <Head>
        <title>Yoga Sof</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


    </div>
  );
}
