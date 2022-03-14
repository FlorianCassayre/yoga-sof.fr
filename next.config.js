const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    providerImportSource: '@mdx-js/react',
  },
});

module.exports = withMDX({
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
});
