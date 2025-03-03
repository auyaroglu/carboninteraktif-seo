import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    API_KEY: process.env.API_KEY,
    PAGESPEED_API_KEY: process.env.PAGESPEED_API_KEY,
  },
  // Arama motorlarının indekslemesini engelle
  poweredByHeader: false,
};

export default nextConfig;
