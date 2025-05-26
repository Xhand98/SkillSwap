import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillSwap",
    short_name: "skillswap",
    description: "Centro de intercambio de habilidades y conocimientos.",
    start_url: "/",
    display: "standalone",
    background_color: "#1A1A1A",
    theme_color: "#6E34F3",
    icons: [
      {
        src: "images/icons/favicon.ico",
        sizes: "any",
        type: "image/ico",
      },
      {
        src: "images/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "images/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "images/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "images/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "images/icons/apple-touch-icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
