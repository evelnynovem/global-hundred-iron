import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://fspbgwnjjisghtoeilmt.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_a8DBaYqMZSVBieHXH84ijQ_-IExeflf",
  },
};

export default nextConfig;
