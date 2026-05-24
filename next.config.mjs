/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // L'image distante de Supabase Storage est autorisée si on l'utilise plus tard.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"]
  }
};

export default nextConfig;
