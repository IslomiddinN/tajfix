import { loadRootEnv } from '../../load-env.mjs';

// Pull DB credentials / NextAuth secret from the single repo-root .env.
loadRootEnv();

const nextConfig = {
  reactStrictMode: true,
  // Allow importing shared code (lib/, components/, app-shell/) that lives
  // outside this app's directory.
  experimental: { externalDir: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }]
  }
};

export default nextConfig;
