import type { MetadataRoute } from "next";

// Next metadata route'u: /manifest.webmanifest olarak sunulur.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fitness Takip",
    short_name: "Fitness",
    description: "Egzersiz ve beslenme takibi",
    // Ana ekrandan açılınca tarayıcı çubuğu görünmez
    display: "standalone",
    start_url: "/exercises",
    scope: "/",
    background_color: "#17181B",
    theme_color: "#17181B",
    orientation: "portrait",
    lang: "tr",
    dir: "ltr",
    categories: ["health", "fitness"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Beslenme", url: "/nutrition" },
      { name: "Rutinler", url: "/routines" },
    ],
  };
}
