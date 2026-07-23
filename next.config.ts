import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker imajının küçük kalması için (plan.md §8)
  output: "standalone",
  images: {
    remotePatterns: [
      // wger egzersiz görselleri (Faz 3'te kullanılacak)
      { protocol: "https", hostname: "wger.de" },
      { protocol: "https", hostname: "**.wger.de" },
    ],
  },
};

export default nextConfig;
