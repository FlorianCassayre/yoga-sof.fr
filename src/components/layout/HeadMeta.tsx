import Head from 'next/head';
import React from 'react';

interface HeadMetaProps {
  title?: string;
  description?: string;
}

export const HeadMeta: React.FC<HeadMetaProps> = ({ title, description }) => {
  return (
    <Head>
      <title>{title}</title>

      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.webmanifest" />

      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#fff" />
      <meta name="application-name" content="Yoga Sof" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Yoga Sof" />

      {description !== undefined && (
        <meta name="description" content={description} />
      )}
      <meta name="keywords" content="cours, yoga, hésingue, comète, hégenheim, saint-louis agglomération, alsace, De Gasquet, renforcement musculaire, essai, à la carte, hatha" />
    </Head>
  );
}
