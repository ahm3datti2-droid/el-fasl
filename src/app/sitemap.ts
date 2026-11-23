import type { MetadataRoute } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://el-fasl.vercel.app";

// Public pages only — protected pages are never listed, so link previews
// can never leak inner content.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/forgot-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
