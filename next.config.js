/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 15, no experimental flag needed
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.elevenlabs.io",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig