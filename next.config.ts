import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* EL FASL: auth-heavy app — root layout reads the theme cookie and
     protected layouts read the session server-side, so Cache Components
     (which forbids uncached cookie access during prerender) is off.
     Pages render dynamically where they need the session. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
