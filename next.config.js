const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    providerImportSource: '@mdx-js/react',
  },
});

const nextTypeSafePages = require("next-type-safe-routes/plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  options: {
    providerImportSource: '@mdx-js/react',
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:slug*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXTAUTH_URL,
          },
        ],
      },
    ];
  },
};

module.exports = () => {
  const plugins = [withMDX, nextTypeSafePages];
  const config = plugins.reduce((acc, next) => next(acc), {
    ...nextConfig,
  });
  return config;
};
