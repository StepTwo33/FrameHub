import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Frame Hub - Warframe Build Planner",
    short_name: "Frame Hub",
    description:
      "Plan and optimize your Warframe weapon and warframe builds with real-time stat calculations.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a1a",
    theme_color: "#0a0a1a",
    orientation: "any",
    categories: ["games", "utilities"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
