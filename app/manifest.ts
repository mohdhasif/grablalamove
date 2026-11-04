import type { MetadataRoute } from "next";

// Enables "Add to Home Screen" on phones so it opens like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GrabLalaMove",
    short_name: "GrabLala",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#18181b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
