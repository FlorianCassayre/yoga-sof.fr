module.exports = {
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
    ]
  },
}
