import Head from 'next/head';
import React from 'react';
import { useRouter } from 'next/router';

interface HeadMetaProps {
  title?: string;
  description?: string;
}

export const HeadMeta: React.FC<HeadMetaProps> = ({ title, description }) => {
  const router = useRouter();
  const path = router.asPath;
  const canonicalUrl = 'https://yoga-sof.fr' + (path !== '/' ? path : '');
  const banner = '/images/maison-japon.jpg';
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      {description !== undefined && (
        <meta name="description" content={description} />
      )}
      <meta name="keywords" content="cours, yoga, hésingue, comète, hégenheim, saint-louis agglomération, alsace, De Gasquet, renforcement musculaire, essai, à la carte, hatha" />

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

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Yoga Sof" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      {description !== undefined && (
        <meta property="og:description" content={description} />
      )}
      <meta property="og:image" content={banner} />
      <meta property="og:locale" content="fr_FR" />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      {description !== undefined && (
        <meta property="twitter:description" content={description} />
      )}
      <meta property="twitter:image" content={banner} />
    </Head>
  );
}
