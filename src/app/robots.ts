import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://el-fasl.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/forgot-password"],
        disallow: [
          "/dashboard",
          "/challenges",
          "/simulator",
          "/flip-class",
          "/classroom-tools",
          "/ideas",
          "/teacher-unfiltered",
          "/teacher-help",
          "/league",
          "/notifications",
          "/profile",
          "/settings",
          "/admin",
          "/api/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
