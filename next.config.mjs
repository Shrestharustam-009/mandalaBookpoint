/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack configuration to satisfy Next.js 16 build requirements
  // (we still keep the custom webpack config for dev/compatibility)
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Mark database packages as server-only (never bundle them for client)
  // This prevents pg, mysql2, etc. from being bundled in client code
  serverExternalPackages: ['pg', 'pg-native', 'mysql2', 'better-sqlite3'],
  webpack: (config, { isServer }) => {
    // Prevent server-only libraries (like `pg`) from breaking client bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        path: false,
        crypto: false,
      };
      // Exclude pg and other database libraries from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'pg': 'commonjs pg',
        'pg-native': 'commonjs pg-native',
        'mysql2': 'commonjs mysql2',
        'better-sqlite3': 'commonjs better-sqlite3',
      });
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/serve-upload/:path*',
      },
    ];
  },
};

export default nextConfig
