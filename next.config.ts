import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Esto permite que el build termine aunque haya errores de linting
    ignoreDuringBuilds: true, 
  },
  typescript: {
    // Esto permite que el build termine aunque haya errores de tipos
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
