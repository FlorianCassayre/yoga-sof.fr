import Head from 'next/head';

export function HeadMeta({ title }) {
  return (
    <Head>
      <link rel="icon" href="/favicon.ico" />
      {title && <title>{title}</title>}
    </Head>
  );
}
